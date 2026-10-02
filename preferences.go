package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type preferences struct {
	DefaultOutputFolder string `json:"defaultOutputFolder"`
}

func preferencesFilePath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, "SquarePad", "settings.json"), nil
}

func (a *App) GetDefaultOutputFolder() (string, error) {
	path, err := preferencesFilePath()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return "", nil
	}
	if err != nil {
		return "", err
	}

	var saved preferences
	if err := json.Unmarshal(data, &saved); err != nil {
		return "", err
	}
	return saved.DefaultOutputFolder, nil
}

func (a *App) SetDefaultOutputFolder(folder string) error {
	path, err := preferencesFilePath()
	if err != nil {
		return err
	}

	folder = strings.TrimSpace(folder)
	if folder != "" {
		folder = filepath.Clean(folder)
	}
	data, err := json.Marshal(preferences{DefaultOutputFolder: folder})
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o600)
}