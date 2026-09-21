<h1 align="center" style="font-size: 64px; line-height: 64px;"> <img src="https://raw.githubusercontent.com/olieinar/SquarePad/refs/heads/main/build/appicon.png" alt="SquarePad App Icon" height="84" align="middle" /> SquarePad </h1>

SquarePad is a desktop app for turning rectangular images into square images by padding them with a transparent, white, or custom background color.

## Features

- Drag and drop files or folders
- Select multiple images at once
- Keep the original image centered without cropping
- Export square images with transparent, white, or custom backgrounds
- Preserve EXIF orientation when supported
- Generate unique output filenames to avoid overwrites
- Process multiple files with progress feedback

## Supported inputs

- JPG / JPEG / JFIF
- PNG
- WebP
- BMP / TIFF
- GIF
- AVIF

## Requirements

- Go 1.25.0
- Node.js and npm
- Wails v3 CLI

Install Wails:

```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

## Run locally

```bash
wails3 dev
```

## Build

```bash
wails3 build
```

## Contributing

Contributions are welcome. Open an issue or submit a pull request with a clear description of the change.
