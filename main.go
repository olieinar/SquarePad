package main

import (
	"context"
	"embed"
	"log"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/updater"
	"github.com/wailsapp/wails/v3/pkg/updater/providers/github"
)

var currentVersion = "1.0.0"

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Name: "SquarePad",
		Services: []application.Service{
			application.NewService(NewApp()),
		},
		Assets: application.AssetOptions{
			Handler: application.BundledAssetFileServer(assets),
		},
	})
	githubProvider, err := github.New(github.Config{
		Repository:    "olieinar/SquarePad",
		ChecksumAsset: "SHA256SUMS",
	})
	if err != nil {
		log.Fatal(err)
	}
	if err := app.Updater.Init(updater.Config{
		CurrentVersion: currentVersion,
		Providers:      []updater.Provider{githubProvider},
	}); err != nil {
		log.Fatal(err)
	}

	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:          "SquarePad",
		Width:          820,
		Height:         620,
		MinWidth:       680,
		MinHeight:      500,
		EnableFileDrop: true,
	})
	window.OnWindowEvent(events.Common.WindowFilesDropped, func(event *application.WindowEvent) {
		application.Get().Event.Emit("files-dropped", event.Context().DroppedFiles())
	})

	menu := app.Menu.New()
	app.Menu.SetApplicationMenu(menu)
	appMenu := menu.AddSubmenu("App")
	appMenu.Add("Check for Updates...").OnClick(func(*application.Context) {
		go func() {
			if err := app.Updater.CheckAndInstall(context.Background()); err != nil {
				log.Printf("update check failed: %v", err)
			}
		}()
	})
	appMenu.AddSeparator()
	appMenu.Add("Quit").OnClick(func(*application.Context) {
		app.Quit()
	})

	go func() {
		time.Sleep(3 * time.Second)
		if err := app.Updater.CheckAndInstall(context.Background()); err != nil {
			log.Printf("startup update check failed: %v", err)
		}
	}()

	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
