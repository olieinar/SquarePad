package main

var supportedExtensions = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".jpe":  {},
	".jfif": {},
	".png":  {},
	".webp": {},
	".bmp":  {},
	".dib":  {},
	".tif":  {},
	".tiff": {},
	".gif":  {},
	".avif": {},
}

type App struct {
}

type ProgressEvent struct {
    Index      int    `json:"index"`
    Total      int    `json:"total"`
    Path       string `json:"path"`
    Name       string `json:"name"`
    Percent    int    `json:"percent"`
    Status     string `json:"status"`
    Error      string `json:"error,omitempty"`
    OutputPath string `json:"outputPath,omitempty"`
}

type FailedImage struct {
	Path  string `json:"path"`
	Error string `json:"error"`
}

type ProcessResult struct {
	Processed    int           `json:"processed"`
	Failed       []FailedImage `json:"failed"`
	OutputFolder string        `json:"outputFolder"`
}

type ProcessingOptions struct {
	OutputFormat      string `json:"outputFormat"`
	Quality           int    `json:"quality"`
	Overwrite         bool   `json:"overwrite"`
	PreserveStructure bool   `json:"preserveStructure"`
	Background        string `json:"background"`
	MaxSize           int    `json:"maxSize"`
}
