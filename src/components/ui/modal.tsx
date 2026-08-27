import { type ReactNode, useEffect, useId, useRef } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Rendered in the sticky footer — usually a cancel/confirm pair. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Accessible dialog used for the School Admin confirm/reset flows.
 *
 * Hand-rolled rather than pulled from a UI library: this is the only dialog
 * pattern in the app, and adding a headless-UI dependency for it would be a
 * larger change than the component itself. It covers the behaviour that
 * matters — labelled `role="dialog"`, Escape to close, focus moved in on open
 * and restored on close, Tab cycled inside, background scroll locked, and a
 * backdrop click that dismisses.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'rounded-koyi-xl bg-koyi-card relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col shadow-xl',
          className,
        )}
      >
        <header className="border-koyi-border flex items-start gap-4 border-b px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-koyi-text font-display text-lg font-bold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-koyi-muted mt-1 text-sm">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-koyi-muted hover:bg-koyi-surface hover:text-koyi-text -mt-1 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="border-koyi-border flex flex-wrap items-center justify-end gap-3 border-t px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
