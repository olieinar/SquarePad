type ProgressAreaProps = {
  progressValue: number;
  status: string;
  busy: boolean;
  hasImages: boolean;
  onProcess: () => void;
};

export function ProgressArea({
  progressValue,
  status,
  busy,
  hasImages,
  onProcess,
}: ProgressAreaProps) {
  return (
    <section className="progress-area">
      <div className="progress-track" aria-label="Processing progress">
        <div className="progress-fill" style={{ width: `${progressValue}%` }} />
      </div>
      <div className="status-row">
        <span>{status}</span>
        <button className="primary" onClick={onProcess} disabled={busy || !hasImages}>
          {busy ? "Processing…" : "Make Square"}
        </button>
      </div>
    </section>
  );
}
