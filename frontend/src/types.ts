export type Padding = "transparent" | "white";
export type Theme = "system" | "light" | "dark";
export type OutputFormat = "png" | "jpeg";

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
  name: string;
  percent: number;
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
