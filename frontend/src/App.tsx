import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";
import {
  ProcessImages,
  SelectImages,
  SelectOutputFolder,
} from "../wailsjs/go/main/App";
import {
  EventsOn,
  OnFileDrop,
  OnFileDropOff,
} from "../wailsjs/runtime/runtime";
import { BackgroundControls } from "./components/BackgroundControls";
import { ImageList } from "./components/ImageList";
import { OutputFolderField } from "./components/OutputFolderField";
import { ProgressArea } from "./components/ProgressArea";
import { SettingsModal } from "./components/SettingsModal";
import { useImageSelection } from "./hooks/useImageSelection";
import { useImagePreviews } from "./hooks/useImagePreviews";
import { useTheme } from "./hooks/useTheme";
import { HoverPreview, Padding, ProcessResult, ProcessingOptions, ProgressEvent, Theme } from "./types";

function filename(path: string) {
  const parts = path.replaceAll("\\", "/").split("/");
  return parts.at(-1) || path;
}

function App() {
  const [theme, setTheme] = useTheme();
  const [recursive, setRecursive] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    outputFormat: "png",
    quality: 90,
    overwrite: false,
    preserveStructure: false,
    background: "padding",
    maxSize: 0,
  });
  const [padding, setPadding] = useState<Padding>("transparent");
  const [outputFolder, setOutputFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent>({
    index: 0,
    total: 0,
    name: "",
    percent: 0,
  });
  const [status, setStatus] = useState("Choose or drop images to begin.");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<HoverPreview | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    paths,
    selected,
    addPaths,
    toggleSelected,
    removeSelected,
    clearImages,
  } = useImageSelection({
    recursive,
    outputFolder,
    setOutputFolder,
    setStatus,
    setError,
    setResult,
    setProgress,
  });
  const previewUrls = useImagePreviews(paths);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen]);

  useEffect(() => {
    OnFileDrop((_x, _y, droppedPaths) => {
      setDragging(false);
      void addPaths(droppedPaths);
    }, false);

    const stopProgress = EventsOn("processing:progress", (payload: ProgressEvent) => {
      setProgress(payload);
      setStatus(`Processing ${payload.index} of ${payload.total}: ${payload.name}`);
    });

    const dragEnter = () => setDragging(true);
    const dragLeave = () => setDragging(false);
    window.addEventListener("dragenter", dragEnter);
    window.addEventListener("dragleave", dragLeave);
    window.addEventListener("drop", dragLeave);

    return () => {
      stopProgress();
      OnFileDropOff();
      window.removeEventListener("dragenter", dragEnter);
      window.removeEventListener("dragleave", dragLeave);
      window.removeEventListener("drop", dragLeave);
    };
  }, [addPaths]);

  const chooseImages = async () => {
    try {
      const chosen = await SelectImages();
      await addPaths(chosen);
    } catch (cause) {
      setError(String(cause));
    }
  };

  const chooseOutput = async () => {
    try {
      const folder = await SelectOutputFolder(outputFolder);
      if (folder) setOutputFolder(folder);
    } catch (cause) {
      setError(String(cause));
    }
  };

  const processImages = async () => {
    if (!paths.length) {
      setError("Choose or drop at least one image first.");
      return;
    }
    if (!outputFolder.trim()) {
      setError("Choose an output folder first.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    setProgress({ index: 1, total: paths.length, name: filename(paths[0]), percent: 0 });

    try {
      const response = (await ProcessImages(
        paths,
        outputFolder,
        padding,
        processingOptions,
      )) as ProcessResult;
      setResult(response);
      setProgress({
        index: paths.length,
        total: paths.length,
        name: "",
        percent: 100,
      });
      setStatus(`Finished: ${response.processed} processed, ${response.failed.length} failed.`);
    } catch (cause) {
      setError(String(cause));
      setStatus("Processing stopped.");
    } finally {
      setBusy(false);
    }
  };

  const progressValue = busy || result ? progress.percent : 0;
  const backgroundMode = processingOptions.background === "white"
    ? "white"
    : processingOptions.background.startsWith("#")
      ? "custom"
      : "transparent";
  const supportedLabel = useMemo(
    () => "JPG · JFIF · PNG · WebP · BMP · TIFF · GIF · AVIF",
    [],
  );

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <h1>SquarePad</h1>
          <p>Add transparent or colored padding to make images square without cropping.</p>
        </div>
        <div className="hero-tools">
          <div className="format-pill">{supportedLabel}</div>
          <button
            className="settings-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            title="Open settings"
          >
            <Settings size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      {settingsOpen && (
        <SettingsModal
          theme={theme}
          setTheme={setTheme}
          processingOptions={processingOptions}
          setProcessingOptions={setProcessingOptions}
          recursive={recursive}
          setRecursive={setRecursive}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <ImageList
        paths={paths}
        previewUrls={previewUrls}
        selected={selected}
        busy={busy}
        dragging={dragging}
        hoverPreview={hoverPreview}
        setHoverPreview={setHoverPreview}
        onChoose={chooseImages}
        onToggle={toggleSelected}
        onRemove={removeSelected}
        onClear={clearImages}
      />

      <section className="options-panel">
        <BackgroundControls
          backgroundMode={backgroundMode}
          padding={padding}
          setPadding={setPadding}
          setProcessingOptions={setProcessingOptions}
          processingOptions={processingOptions}
          busy={busy}
        />

        <OutputFolderField
          outputFolder={outputFolder}
          busy={busy}
          onChange={setOutputFolder}
          onBrowse={chooseOutput}
        />
      </section>

      <ProgressArea
        progressValue={progressValue}
        status={status}
        busy={busy}
        hasImages={paths.length > 0}
        onProcess={processImages}
      />

      {error && <div className="notice error">{error}</div>}

      {result && (
        <div className={`notice ${result.failed.length ? "warning" : "success"}`}>
          <strong>
            {result.failed.length
              ? `Finished with ${result.failed.length} error(s)`
              : `Processed ${result.processed} image(s)`}
          </strong>
          <span>Saved to {result.outputFolder}</span>
          {result.failed.slice(0, 8).map((failure) => (
            <small key={failure.path}>{filename(failure.path)} — {failure.error}</small>
          ))}
          {result.failed.length > 8 && (
            <small>…and {result.failed.length - 8} more</small>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
