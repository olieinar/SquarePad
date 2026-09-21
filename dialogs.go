package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func (a *App) SelectImages() ([]string, error) {
	paths, err := application.Get().Dialog.OpenFile().
		SetTitle("Choose images").
		CanChooseFiles(true).
		AddFilter("Supported images", "*.jpg;*.jpeg;*.jpe;*.jfif;*.png;*.webp;*.bmp;*.dib;*.tif;*.tiff;*.gif;*.avif").
		AddFilter("All files", "*.*").
		PromptForMultipleSelection()
	if err != nil {
		return nil, err
	}
	return a.ExpandPaths(paths, false)
}

func (a *App) SelectOutputFolder(current string) (string, error) {
	dialog := application.Get().Dialog.OpenFile().
		SetTitle("Choose output folder").
		CanChooseDirectories(true).
		CanChooseFiles(false)
	if current != "" {
		if info, err := os.Stat(current); err == nil && info.IsDir() {
			dialog.SetDirectory(current)
		}
	}
	return dialog.PromptForSingleSelection()
}

func (a *App) SuggestedOutputFolder(sourcePath string) string {
	if strings.TrimSpace(sourcePath) == "" {
		return ""
	}
	return filepath.Join(filepath.Dir(sourcePath), "out")
}
