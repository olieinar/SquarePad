import { Dispatch, SetStateAction } from "react";
import { Padding, ProcessingOptions } from "../types";

type BackgroundControlsProps = {
  backgroundMode: "transparent" | "white" | "custom";
  padding: Padding;
  setPadding: Dispatch<SetStateAction<Padding>>;
  setProcessingOptions: Dispatch<SetStateAction<ProcessingOptions>>;
  processingOptions: ProcessingOptions;
  busy: boolean;
};

export function BackgroundControls({
  backgroundMode,
  setPadding,
  setProcessingOptions,
  processingOptions,
  busy,
}: BackgroundControlsProps) {
  return (
    <div className="option-group">
      <span className="option-label">Background</span>
      <div className="segmented background-segmented">
        <button
          className={backgroundMode === "transparent" ? "active" : ""}
          onClick={() => {
            setPadding("transparent");
            setProcessingOptions((current) => ({ ...current, background: "transparent" }));
          }}
          disabled={busy}
        >
          Transparent
        </button>
        <button
          className={backgroundMode === "white" ? "active" : ""}
          onClick={() => {
            setPadding("white");
            setProcessingOptions((current) => ({ ...current, background: "white" }));
          }}
          disabled={busy}
        >
          White
        </button>
        <button
          className={backgroundMode === "custom" ? "active" : ""}
          onClick={() => {
            setPadding("transparent");
            setProcessingOptions((current) => ({
              ...current,
              background: current.background.startsWith("#") ? current.background : "#FFFFFF",
            }));
          }}
          disabled={busy}
        >
          Custom
        </button>
      </div>
      {backgroundMode === "custom" && (
        <input
          className="color-picker"
          type="color"
          value={processingOptions.background}
          aria-label="Custom background color"
          onChange={(event) =>
            setProcessingOptions((current) => ({
              ...current,
              background: event.target.value,
            }))
          }
          disabled={busy}
        />
      )}
    </div>
  );
}
