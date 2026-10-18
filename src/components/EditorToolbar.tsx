import { FileUp } from 'lucide-react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';

type EditorToolbarProps = {
  children: ReactNode;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  onUpload?: (file: File) => void;
  uploadLabel?: string;
};

export function EditorToolbar({
  children,
  fileInputRef,
  onUpload,
  uploadLabel = 'Upload JSON file',
}: EditorToolbarProps) {
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file && onUpload) {
      onUpload(file);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onUpload ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleFile}
            aria-label={uploadLabel}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef?.current?.click()}
          >
            <FileUp className="size-4" aria-hidden="true" />
            Upload
          </button>
        </>
      ) : null}
      {children}
    </div>
  );
}
