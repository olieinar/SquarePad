package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SelectImages() ([]string, error) {
	paths, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Choose images",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Supported images",
				Pattern:     "*.jpg;*.jpeg;*.jpe;*.jfif;*.png;*.webp;*.bmp;*.dib;*.tif;*.tiff;*.gif;*.avif",
			},
			{DisplayName: "All files", Pattern: "*.*"},
		},
	})
	if err != nil {
		return nil, err
	}
	return a.ExpandPaths(paths, false)
}

func (a *App) SelectOutputFolder(current string) (string, error) {
	options := runtime.OpenDialogOptions{Title: "Choose output folder"}
	if current != "" {
		if info, err := os.Stat(current); err == nil && info.IsDir() {
			options.DefaultDirectory = current
		}
	}
	return runtime.OpenDirectoryDialog(a.ctx, options)
}

func (a *App) SuggestedOutputFolder(sourcePath string) string {
	if strings.TrimSpace(sourcePath) == "" {
		return ""
	}
	return filepath.Join(filepath.Dir(sourcePath), "out")
}
