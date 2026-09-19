package main

import (
	"fmt"
	"image/color"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// ExpandPaths accepts files and folders from the file picker or OS drag/drop.
func (a *App) ExpandPaths(paths []string, recursive bool) ([]string, error) {
	seen := make(map[string]struct{})
	result := make([]string, 0, len(paths))

	addFile := func(path string) {
		absolute, err := filepath.Abs(path)
		if err != nil {
			return
		}
		absolute = filepath.Clean(absolute)
		if !isSupportedImage(absolute) {
			return
		}
		key := absolute
		if filepath.Separator == '\\' {
			key = strings.ToLower(key)
		}
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		result = append(result, absolute)
	}

	for _, rawPath := range paths {
		if strings.TrimSpace(rawPath) == "" {
			continue
		}
		info, err := os.Stat(rawPath)
		if err != nil {
			continue
		}
		if !info.IsDir() {
			addFile(rawPath)
			continue
		}

		if recursive {
			_ = filepath.WalkDir(rawPath, func(path string, entry os.DirEntry, walkErr error) error {
				if walkErr == nil && !entry.IsDir() {
					addFile(path)
				}
				return nil
			})
			continue
		}

		entries, err := os.ReadDir(rawPath)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				addFile(filepath.Join(rawPath, entry.Name()))
			}
		}
	}

	sort.Strings(result)
	return result, nil
}

func isSupportedImage(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	_, ok := supportedExtensions[ext]
	return ok
}

func outputPathFor(outputFolder, sourcePath string, paths []string, options ProcessingOptions) (string, error) {
	stem := strings.TrimSuffix(filepath.Base(sourcePath), filepath.Ext(sourcePath))
	extension := "." + options.OutputFormat
	directory := outputFolder
	if options.PreserveStructure {
		root := filepath.Dir(paths[0])
		for _, path := range paths[1:] {
			for {
				relative, err := filepath.Rel(root, filepath.Dir(path))
				if err == nil && !strings.HasPrefix(relative, ".."+string(filepath.Separator)) && relative != ".." {
					break
				}
				parent := filepath.Dir(root)
				if parent == root {
					break
				}
				root = parent
			}
		}
		relative, err := filepath.Rel(root, filepath.Dir(sourcePath))
		if err != nil {
			return "", err
		}
		directory = filepath.Join(outputFolder, relative)
	}
	candidate := filepath.Join(directory, stem+extension)
	if options.Overwrite {
		return candidate, nil
	}
	counter := 2
	for {
		_, err := os.Stat(candidate)
		if os.IsNotExist(err) {
			return candidate, nil
		}
		if err != nil {
			return "", err
		}
		candidate = filepath.Join(directory, fmt.Sprintf("%s_%d%s", stem, counter, extension))
		counter++
	}
}

func parseBackground(value string) (color.NRGBA, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "transparent":
		return color.NRGBA{R: 255, G: 255, B: 255, A: 0}, nil
	case "white":
		return color.NRGBA{R: 255, G: 255, B: 255, A: 255}, nil
	}
	value = strings.TrimPrefix(strings.TrimSpace(value), "#")
	if len(value) != 6 {
		return color.NRGBA{}, fmt.Errorf("invalid background color: %s", value)
	}
	redValue, redErr := strconv.ParseUint(value[0:2], 16, 8)
	greenValue, greenErr := strconv.ParseUint(value[2:4], 16, 8)
	blueValue, blueErr := strconv.ParseUint(value[4:6], 16, 8)
	if redErr != nil || greenErr != nil || blueErr != nil {
		return color.NRGBA{}, fmt.Errorf("invalid background color: %s", value)
	}
	return color.NRGBA{R: uint8(redValue), G: uint8(greenValue), B: uint8(blueValue), A: 255}, nil
}
