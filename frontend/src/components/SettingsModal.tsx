import { Dispatch, SetStateAction } from "react";
import { Monitor, Moon, Sun, X } from "lucide-react";
import { OutputFormat, ProcessingOptions, Theme } from "../types";

type SettingsModalProps = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  processingOptions: ProcessingOptions;
  setProcessingOptions: Dispatch<SetStateAction<ProcessingOptions>>;
  recursive: boolean;
  setRecursive: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
};

export function SettingsModal({
  theme,
  setTheme,
  processingOptions,
  setProcessingOptions,
  recursive,
  setRecursive,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">PREFERENCES</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="settings-row">
          <div>
            <strong>Appearance</strong>
            <small>Choose how the app looks.</small>
          </div>
          <div className="theme-switcher" aria-label="Theme">
            {(["system", "light", "dark"] as Theme[]).map((option) => (
              <button
                key={option}
                className={theme === option ? "active" : ""}
                onClick={() => setTheme(option)}
                aria-label={`${option} theme`}
                aria-pressed={theme === option}
              >
                {option === "system" && <Monitor size={14} aria-hidden="true" />}
                {option === "light" && <Sun size={14} aria-hidden="true" />}
                {option === "dark" && <Moon size={14} aria-hidden="true" />}
                <span>{option[0].toUpperCase() + option.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-grid">
          <label className="setting-field">
            <span>Output format</span>
            <select
              value={processingOptions.outputFormat}
              onChange={(event) =>
                setProcessingOptions((current) => ({
                  ...current,
                  outputFormat: event.target.value as OutputFormat,
                }))
              }
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
          {processingOptions.outputFormat === "jpeg" && (
            <label className="setting-field">
              <span>JPEG quality</span>
              <input
                type="number"
                min="1"
                max="100"
                value={processingOptions.quality}
                onChange={(event) =>
                  setProcessingOptions((current) => ({
                    ...current,
                    quality: Number(event.target.value),
                  }))
                }
              />
            </label>
          )}
          <label className="setting-field">
            <span>Maximum size</span>
            <input
              type="number"
              min="0"
              placeholder="No limit"
              value={processingOptions.maxSize || ""}
              onChange={(event) =>
                setProcessingOptions((current) => ({
                  ...current,
                  maxSize: Number(event.target.value) || 0,
                }))
              }
            />
          </label>
        </div>

        <div className="settings-checks">
          <label>
            <input
              type="checkbox"
              checked={recursive}
              onChange={(event) => setRecursive(event.target.checked)}
            />
            Process folders recursively
          </label>
          <label>
            <input
              type="checkbox"
              checked={processingOptions.preserveStructure}
              onChange={(event) =>
                setProcessingOptions((current) => ({
                  ...current,
                  preserveStructure: event.target.checked,
                }))
              }
            />
            Preserve folder structure
          </label>
          <label>
            <input
              type="checkbox"
              checked={processingOptions.overwrite}
              onChange={(event) =>
                setProcessingOptions((current) => ({
                  ...current,
                  overwrite: event.target.checked,
                }))
              }
            />
            Overwrite existing files
          </label>
        </div>
      </section>
    </div>
  );
}
