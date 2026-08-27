import { type ClipboardEvent, type KeyboardEvent, useId, useRef } from 'react';

import { cn } from '@/lib/utils/cn';

export interface OtpInputProps {
  label: string;
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Fired once the final box is filled, so the form can submit without a click. */
  onComplete?: (value: string) => void;
  error?: string | undefined;
  disabled?: boolean;
}

/**
 * Segmented numeric code entry.
 *
 * The boxes are presentation: the source of truth is one `value` string, and
 * each box renders `value[index]`. That keeps paste, backspace-across-boxes
 * and browser autofill from having to reconcile six independent states.
 *
 * `inputMode="numeric"` + `autoComplete="one-time-code"` lets mobile keyboards
 * show digits and lets the OS offer the code straight from the SMS/email.
 */
export function OtpInput({
  label,
  length,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
}: OtpInputProps) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  function focusBox(index: number) {
    boxRefs.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  }

  function commit(next: string) {
    const digits = next.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
    return digits;
  }

  function handleInput(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;

    // Typing into a box replaces that position; a multi-digit burst (autofill,
    // fast typing) spills forward into the boxes after it.
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(
      0,
      length,
    );
    const committed = commit(next);
    focusBox(Math.min(index + digits.length, committed.length));
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
        return;
      }
      // Empty box: step back and clear the one before it.
      commit(value.slice(0, index - 1) + value.slice(index));
      focusBox(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const committed = commit(event.clipboardData.getData('text'));
    focusBox(committed.length);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={generatedId} className="text-koyi-text text-sm font-medium">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={generatedId}
        aria-describedby={error ? errorId : undefined}
        className="flex items-center justify-between gap-2 sm:gap-3"
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              boxRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={length}
            disabled={disabled}
            aria-label={`Digit ${String(index + 1)} of ${String(length)}`}
            aria-invalid={Boolean(error)}
            value={value[index] ?? ''}
            onChange={(event) => {
              handleInput(index, event.target.value);
            }}
            onKeyDown={(event) => {
              handleKeyDown(index, event);
            }}
            onPaste={handlePaste}
            onFocus={(event) => {
              event.target.select();
            }}
            className={cn(
              'rounded-koyi-md text-koyi-text h-14 w-full border text-center text-xl font-semibold tabular-nums',
              'focus-visible:outline-koyi-primary focus-visible:outline-2 focus-visible:outline-offset-2',
              'disabled:bg-koyi-surface disabled:opacity-60',
              error ? 'border-koyi-danger' : 'border-koyi-border bg-white',
            )}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-koyi-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
