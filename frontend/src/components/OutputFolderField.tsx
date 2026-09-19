type OutputFolderFieldProps = {
  outputFolder: string;
  busy: boolean;
  onChange: (value: string) => void;
  onBrowse: () => void;
};

export function OutputFolderField({
  outputFolder,
  busy,
  onChange,
  onBrowse,
}: OutputFolderFieldProps) {
  return (
    <div className="output-row">
      <label htmlFor="output">Output folder</label>
      <input
        id="output"
        value={outputFolder}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Choose an output folder"
        disabled={busy}
      />
      <button className="secondary" onClick={onBrowse} disabled={busy}>Browse…</button>
    </div>
  );
}
