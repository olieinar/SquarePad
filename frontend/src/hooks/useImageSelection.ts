import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { App as SquarePad } from "../../bindings/squarepad";
import { ProgressEvent, ProcessResult } from "../types";

type UseImageSelectionOptions = {
  recursive: boolean;
  outputFolder: string;
  setOutputFolder: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  setResult: Dispatch<SetStateAction<ProcessResult | null>>;
  setProgress: Dispatch<SetStateAction<ProgressEvent>>;
};

export function useImageSelection({
  recursive,
  outputFolder,
  setOutputFolder,
  setStatus,
  setError,
  setResult,
  setProgress,
}: UseImageSelectionOptions) {
  const [paths, setPaths] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const addPaths = useCallback(
    async (incoming: string[]) => {
      if (!incoming?.length) return;
      try {
        const expanded = await SquarePad.ExpandPaths(incoming, recursive);
        if (!expanded.length) {
          setStatus("No new supported images were added.");
          return;
        }

        const known = new Set(paths.map((item) => item.toLocaleLowerCase()));
        const additions = expanded.filter((item: string) => {
          const key = item.toLocaleLowerCase();
          if (known.has(key)) return false;
          known.add(key);
          return true;
        });
        if (additions.length) setPaths([...paths, ...additions]);

        if (!outputFolder) {
          const suggested = await SquarePad.SuggestedOutputFolder(expanded[0]);
          if (suggested) setOutputFolder(suggested);
        }
        setResult(null);
        setError("");
        setStatus(
          additions.length > 0
            ? `${paths.length + additions.length} image(s) selected.`
            : "No new supported images were added.",
        );
      } catch (cause) {
        setError(String(cause));
      }
    },
    [outputFolder, paths, recursive, setError, setOutputFolder, setResult, setStatus],
  );

  const toggleSelected = useCallback((path: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const removeSelected = useCallback(() => {
    if (!selected.size) return;
    setPaths((current) => current.filter((path) => !selected.has(path)));
    setSelected(new Set());
    setResult(null);
    setProgress({ index: 0, total: 0, path: "", name: "", percent: 0, status: "pending", });
    setStatus(`${Math.max(0, paths.length - selected.size)} image(s) selected.`);
  }, [paths.length, selected, setProgress, setResult, setStatus]);

  const clearImages = useCallback(() => {
    setPaths([]);
    setSelected(new Set());
    setResult(null);
    setError("");
    setProgress({ index: 0, total: 0, path: "", name: "", percent: 0, status: "pending", });
    setStatus("Choose or drop images to begin.");
  }, [setError, setProgress, setResult, setStatus]);

  return { paths, selected, addPaths, toggleSelected, removeSelected, clearImages };
}
