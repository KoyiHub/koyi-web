import { type DragEvent, useEffect, useId, useRef, useState } from 'react';

import { UploadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

export interface FileDropFieldProps {
  label: string;
  /** Comma-separated accept list, e.g. `image/png,image/jpeg`. */
  accept: string;
  /** Maximum size in bytes. Rejected files never reach `onChange`. */
  maxBytes: number;
  hint: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string | undefined;
  optional?: boolean;
}

function formatBytes(bytes: number): string {
  return bytes >= 1_000_000
    ? `${String(Math.round(bytes / 100_000) / 10)}MB`
    : `${String(Math.round(bytes / 1024))}KB`;
}

/**
 * Click-or-drag image picker with a live preview. Local rejections (wrong
 * type, too large) are surfaced here rather than through the form schema —
 * a file the user can see was refused needs an immediate answer, not one
 * that waits for submit.
 *
 * The preview is read as a data URL rather than an object URL: there is no
 * handle to revoke, so a preview can never outlive the field it belongs to.
 * Reads are cancelled on unmount and whenever the file changes.
 */
export function FileDropField({
  label,
  accept,
  maxBytes,
  hint,
  value,
  onChange,
  error,
  optional = false,
}: FileDropFieldProps) {
  const generatedId = useId();
  const inputId = `${generatedId}-input`;
  const errorId = `${generatedId}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled) setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
    };

    if (value) {
      reader.readAsDataURL(value);
    } else {
      // Reading nothing still has to clear a stale preview, and doing it in a
      // task keeps this out of the render pass.
      queueMicrotask(() => {
        if (!cancelled) setPreviewUrl(null);
      });
    }

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [value]);

  const acceptedTypes = accept.split(',').map((type) => type.trim());

  function acceptFile(file: File) {
    if (!acceptedTypes.includes(file.type)) {
      setLocalError('Choose a PNG or JPG image.');
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(
        `That image is ${formatBytes(file.size)}. Keep it under ${formatBytes(maxBytes)}.`,
      );
      return;
    }
    setLocalError(null);
    onChange(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) acceptFile(file);
  }

  function handleRemove() {
    setLocalError(null);
    onChange(null);
    // The native input keeps its last value, so re-picking the same file would
    // fire no change event without this reset.
    if (inputRef.current) inputRef.current.value = '';
  }

  const shownError = localError ?? error;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-koyi-text text-sm font-medium">
        {label}
        {optional && <span className="text-koyi-muted ml-1.5 text-xs font-normal">(optional)</span>}
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          'rounded-koyi-md flex items-center gap-4 border border-dashed p-4 transition-colors',
          'focus-within:outline-koyi-primary focus-within:outline-2 focus-within:outline-offset-2',
          dragging ? 'border-koyi-primary bg-koyi-primary/5' : 'border-koyi-border bg-white',
          shownError && 'border-koyi-danger',
        )}
      >
        <span className="border-koyi-border bg-koyi-surface flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <UploadIcon className="text-koyi-muted size-5 fill-none stroke-current stroke-2" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          {value ? (
            <p className="text-koyi-text truncate text-sm font-medium">{value.name}</p>
          ) : (
            <p className="text-koyi-text text-sm font-medium">Upload school logo</p>
          )}
          <p className="text-koyi-muted mt-0.5 text-xs">{hint}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label
            htmlFor={inputId}
            className="text-koyi-primary cursor-pointer text-sm font-medium hover:underline"
          >
            {value ? 'Replace' : 'Choose file'}
          </label>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-koyi-muted hover:text-koyi-danger text-sm font-medium"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          aria-invalid={Boolean(shownError)}
          aria-describedby={shownError ? errorId : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) acceptFile(file);
          }}
          className="sr-only"
        />
      </div>

      {shownError && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {shownError}
        </p>
      )}
    </div>
  );
}
