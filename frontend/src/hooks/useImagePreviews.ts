import { useEffect, useState } from "react";
import { Base64Image } from "../../wailsjs/go/main/App";

export function useImagePreviews(paths: string[]) {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    setPreviewUrls({});
    void Promise.all(
      paths.map(async (path) => {
        try {
          return [path, await Base64Image(path)] as const;
        } catch {
          return [path, ""] as const;
        }
      }),
    ).then((previews) => {
      if (!cancelled) setPreviewUrls(Object.fromEntries(previews));
    });

    return () => {
      cancelled = true;
    };
  }, [paths]);

  return previewUrls;
}
