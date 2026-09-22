import { Dispatch, SetStateAction } from "react";
import { Plus, CheckCircle2, LoaderCircle, CircleAlert, RotateCcw } from "lucide-react";
import { HoverPreview, FileState } from "../types";

function filename(path: string) {
  const parts = path.replaceAll("\\", "/").split("/");
  return parts.at(-1) || path;
}

type ImageListProps = {
  paths: string[];
  previewUrls: Record<string, string>;
  selected: Set<string>;
  busy: boolean;
  dragging: boolean;
  hoverPreview: HoverPreview | null;
  setHoverPreview: Dispatch<SetStateAction<HoverPreview | null>>;
  onChoose: () => void;
  onToggle: (path: string) => void;
  onRemove: () => void;
  onClear: () => void;
  fileStates: Record<string, FileState>;
  onReAdd: (path: string) => void;
};

export function ImageList({
  paths,
  previewUrls,
  selected,
  busy,
  dragging,
  hoverPreview,
  fileStates,
  setHoverPreview,
  onChoose,
  onToggle,
  onRemove,
  onClear,
  onReAdd,
}: ImageListProps) {
  return (
    <section
      className={`drop-panel ${dragging ? "is-dragging" : ""}`}
      data-file-drop-target="true"
    >
      <div className="drop-heading">
        <div><h2>{dragging ? "Drop them here" : "Images"}</h2></div>
        <span className="count-badge">{paths.length}</span>
      </div>

      <div className="file-list" role="list">
        {paths.length === 0 ? (
          <button className="empty-state" onClick={onChoose} disabled={busy}>
            <span className="empty-icon"><Plus size={22} aria-hidden="true" /></span>
            <strong>Choose images</strong>
            <span>or drag & drop them here</span>
          </button>
        ) : (
          paths.map((path) => (
            <label
              className={`file-row ${selected.has(path) ? "is-selected" : ""}`}
              key={path}
              title={path}
            >
              <input
                type="checkbox"
                checked={selected.has(path)}
                onChange={() => onToggle(path)}
                disabled={busy}
              />
              <span className="file-status">
                {fileStates[path]?.status === "done" && (
                  <CheckCircle2 size={18} color="green" />
                )}

                {fileStates[path]?.status === "processing" && (
                  <LoaderCircle size={18} className="spin" />
                )}

                {fileStates[path]?.status === "failed" && (
                  <CircleAlert size={18} color="red" />
                )}
              </span>
              <span
                className="file-icon"
                onMouseEnter={(event) =>
                  setHoverPreview({ path, x: event.clientX, y: event.clientY })
                }
                onMouseMove={(event) =>
                  setHoverPreview((current) =>
                    current?.path === path
                      ? { ...current, x: event.clientX, y: event.clientY }
                      : current,
                  )
                }
                onMouseLeave={() => setHoverPreview(null)}
              >
                {previewUrls[path] ? <img src={previewUrls[path]} alt="Image" /> : null}
              </span>
              <span className="file-copy">
                <strong>{filename(path)}</strong>
                <small>{path}</small>
              </span>
              <span className="file-action">
                {fileStates[path]?.status === "done" && (
                  <span className="file-action-readd">
                    <RotateCcw 
                      size={18} 
                      onClick={() => onReAdd(path)} />
                  </span>
                )}
              </span>
            </label>
          ))
        )}
      </div>

      {hoverPreview && previewUrls[hoverPreview.path] && (
        <div
          className="image-zoom-preview"
          style={{
            left: `${Math.min(hoverPreview.x + 16, window.innerWidth - 176)}px`,
            top: `${Math.min(hoverPreview.y + 16, window.innerHeight - 176)}px`,
          }}
        >
          <img src={previewUrls[hoverPreview.path]} alt="" />
        </div>
      )}

      <div className="button-row">
        <button onClick={onChoose} disabled={busy}>Choose Images…</button>
        <button className="secondary" onClick={onRemove} disabled={busy || !selected.size}>
          Remove Selected
        </button>
        <button className="secondary" onClick={onClear} disabled={busy || !paths.length}>
          Clear
        </button>
      </div>
    </section>
  );
}
