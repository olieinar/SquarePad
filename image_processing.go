package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/gen2brain/avif"

	_ "golang.org/x/image/webp"
)

func makeSquare(sourcePath, outputPath, padding string, options ProcessingOptions) error {
	source, err := decodeImage(sourcePath)
	if err != nil {
		return fmt.Errorf("open image: %w", err)
	}

	bounds := source.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()
	if width <= 0 || height <= 0 {
		return fmt.Errorf("image has invalid dimensions %dx%d", width, height)
	}

	squareSize := width
	if height > squareSize {
		squareSize = height
	}

	background, err := parseBackground(options.Background)
	if err != nil {
		return err
	}
	if options.OutputFormat == "jpeg" && background.A == 0 {
		background.A = 255
	}

	canvas := image.NewNRGBA(image.Rect(0, 0, squareSize, squareSize))
	draw.Draw(canvas, canvas.Bounds(), &image.Uniform{C: background}, image.Point{}, draw.Src)

	x := (squareSize - width) / 2
	y := (squareSize - height) / 2
	destination := image.Rect(x, y, x+width, y+height)
	draw.Draw(canvas, destination, source, bounds.Min, draw.Over)
	if options.MaxSize > 0 && squareSize > options.MaxSize {
		canvas = imaging.Resize(canvas, options.MaxSize, options.MaxSize, imaging.Lanczos)
	}

	if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
		return fmt.Errorf("create output directory: %w", err)
	}
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("create output: %w", err)
	}

	var encodeErr error
	if options.OutputFormat == "jpeg" {
		encodeErr = jpeg.Encode(file, canvas, &jpeg.Options{Quality: options.Quality})
	} else {
		encoder := png.Encoder{CompressionLevel: png.DefaultCompression}
		encodeErr = encoder.Encode(file, canvas)
	}
	closeErr := file.Close()
	if encodeErr != nil {
		_ = os.Remove(outputPath)
		return fmt.Errorf("encode image: %w", encodeErr)
	}
	if closeErr != nil {
		return fmt.Errorf("close output: %w", closeErr)
	}
	return nil
}

func decodeImage(path string) (image.Image, error) {
	if strings.EqualFold(filepath.Ext(path), ".avif") {
		file, err := os.Open(path)
		if err != nil {
			return nil, err
		}
		image, decodeErr := avif.Decode(file, avif.Options{AutoRotate: true})
		closeErr := file.Close()
		if decodeErr != nil {
			return nil, decodeErr
		}
		if closeErr != nil {
			return nil, closeErr
		}
		return image, nil
	}
	return imaging.Open(path, imaging.AutoOrientation(true))
}

func (a *App) Base64Image(path string) (string, error) {
	img, err := decodeImage(path)
	if err != nil {
		return "", fmt.Errorf("decode image: %w", err)
	}

	var buf bytes.Buffer
	encoder := png.Encoder{CompressionLevel: png.DefaultCompression}
	if err := encoder.Encode(&buf, img); err != nil {
		return "", fmt.Errorf("encode image: %w", err)
	}
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}
