export type Padding = "transparent" | "white";
export type Theme = "system" | "light" | "dark";
export type OutputFormat = "png" | "jpeg";
export type FileStatus = "pending" | "processing" | "done" | "failed";

export type ProcessingOptions = {
  outputFormat: OutputFormat;
  quality: number;
  overwrite: boolean;
  preserveStructure: boolean;
  background: string;
  maxSize: number;
};

export type ProgressEvent = {
  index: number;
  total: number;
  path: string;
  name: string;
  percent: number;
  status: FileStatus;
  error?: string;
  outputPath?: string;
};

export type FileState = {
  status: FileStatus;
  error?: string;
  outputPath?: string;
};

export type FailedImage = {
  path: string;
  error: string;
};

export type ProcessResult = {
  processed: number;
  failed: FailedImage[];
  outputFolder: string;
};

export type HoverPreview = {
  path: string;
  x: number;
  y: number;
};
