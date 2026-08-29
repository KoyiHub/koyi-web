import { useId, useRef } from 'react';

import { ImageIcon, MicIcon, TrashIcon, UploadIcon, VideoIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

type MediaKind = 'image' | 'audio' | 'video';

interface MediaFieldProps {
  label: string;
  kind: MediaKind;
  /** File name currently attached, or `''`. */
  name: string;
  /** Local preview URL, or `''`. Lost on reload — see the note below. */
  url: string;
  onChange: (next: { name: string; url: string }) => void;
  className?: string;
}

const ACCEPT: Record<MediaKind, string> = {
  image: 'image/png,image/jpeg,image/webp',
  audio: 'audio/mpeg,audio/wav,audio/ogg,audio/webm',
  video: 'video/mp4,video/webm',
};

const KIND_ICON = { image: ImageIcon, audio: MicIcon, video: VideoIcon };

const KIND_HINT: Record<MediaKind, string> = {
  image: 'PNG, JPG or WebP.',
  audio: 'MP3, WAV or OGG.',
  video: 'MP4 or WebM.',
};

/**
 * Attaches one file to a question block or option.
 *
 * PROVISIONAL: no upload endpoint is confirmed, so nothing is uploaded here.
 * The picker records the file's name — which is what the create payload sends
 * in place of a media id — and holds a local object URL so the teacher can
 * check they picked the right file. That preview belongs to this tab: it does
 * not survive a reload, and the copy below says so rather than showing a
 * broken thumbnail. When a real upload endpoint lands, this component posts
 * the file and stores the returned id, and nothing else in the builder moves.
 */
export function MediaField({ label, kind, name, url, onChange, className }: MediaFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = KIND_ICON[kind];

  const replace = (file: File | null) => {
    // Only the URL this component handed out is revoked, and only when it is
    // being replaced — the draft outlives this component every time the
    // teacher visits the question bank and comes back.
    if (url) URL.revokeObjectURL(url);
    onChange(file ? { name: file.name, url: URL.createObjectURL(file) } : { name: '', url: '' });
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-koyi-text text-sm font-medium">{label}</span>

      <div className="border-koyi-border rounded-koyi-md focus-within:outline-koyi-primary flex items-center gap-3 border border-dashed bg-white p-3 focus-within:outline-2 focus-within:outline-offset-2">
        <span className="bg-koyi-surface flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {kind === 'image' && url ? (
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <Icon aria-hidden="true" className="text-koyi-muted size-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          {name ? (
            <p className="text-koyi-text truncate text-sm font-medium">{name}</p>
          ) : (
            <p className="text-koyi-text text-sm font-medium">No file chosen</p>
          )}
          <p className="text-koyi-muted mt-0.5 text-xs">
            {name && !url ? 'Preview unavailable after a reload.' : KIND_HINT[kind]}
          </p>
        </div>

        <label
          htmlFor={inputId}
          className="text-koyi-primary hover:bg-koyi-nav-active inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold"
        >
          <UploadIcon aria-hidden="true" className="size-4" />
          {name ? 'Replace' : 'Choose file'}
        </label>

        {name && (
          <button
            type="button"
            onClick={() => {
              replace(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-koyi-muted hover:text-koyi-danger rounded-md p-1.5"
          >
            <TrashIcon aria-hidden="true" className="size-4" />
            <span className="sr-only">Remove {name}</span>
          </button>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT[kind]}
          onChange={(event) => {
            replace(event.target.files?.[0] ?? null);
          }}
          className="sr-only"
        />
      </div>
    </div>
  );
}
