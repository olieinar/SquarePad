package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func (a *App) ProcessImages(paths []string, outputFolder string, padding string, options ProcessingOptions) (ProcessResult, error) {
	result := ProcessResult{Failed: []FailedImage{}, OutputFolder: outputFolder}

	if len(paths) == 0 {
		return result, fmt.Errorf("choose or drop at least one image first")
	}
	if strings.TrimSpace(outputFolder) == "" {
		return result, fmt.Errorf("choose an output folder first")
	}
	if padding != "transparent" && padding != "white" {
		return result, fmt.Errorf("invalid padding option: %s", padding)
	}
	if options.OutputFormat == "" {
		options.OutputFormat = "png"
	}
	if options.OutputFormat != "png" && options.OutputFormat != "jpeg" {
		return result, fmt.Errorf("unsupported output format: %s", options.OutputFormat)
	}
	if options.Quality < 1 || options.Quality > 100 {
		options.Quality = 90
	}
	if options.Background == "" || options.Background == "padding" {
		options.Background = padding
	}

	outputFolder = filepath.Clean(outputFolder)
	result.OutputFolder = outputFolder
	if err := os.MkdirAll(outputFolder, 0o755); err != nil {
		return result, fmt.Errorf("create output folder: %w", err)
	}

	for index, sourcePath := range paths {
		progress := ProgressEvent{
			Index:   index + 1,
			Total:   len(paths),
			Path:    sourcePath,
			Name:    filepath.Base(sourcePath),
			Percent: index * 100 / len(paths),
			Status:  "processing",
		}

		application.Get().Event.Emit("processing:progress", progress)

		outputPath, err := outputPathFor(outputFolder, sourcePath, paths, options)
		if err == nil {
			err = makeSquare(sourcePath, outputPath, padding, options)
		}

		if err != nil {
			result.Failed = append(result.Failed, FailedImage{
				Path:  sourcePath,
				Error: err.Error(),
			})

			progress.Status = "failed"
			progress.Error = err.Error()
		} else {
			result.Processed++

			progress.Status = "done"
			progress.OutputPath = outputPath
		}

		progress.Percent = (index + 1) * 100 / len(paths)
		application.Get().Event.Emit("processing:progress", progress)
	}

	return result, nil
}
