import { useState } from 'react';

import { EyeIcon, EyeOffIcon, LockIcon } from '@/components/ui/icons';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'icon' | 'trailing' | 'label'> & {
  /** Defaults to "Password" — every current caller wants exactly that. */
  label?: string;
};

/**
 * Password input with a reveal toggle, shared by every auth form so the
 * toggle behaves and reads identically everywhere. The toggle is a real
 * button (keyboard reachable) and announces its state through `aria-pressed`;
 * revealing is per-field and resets on unmount.
 */
export function PasswordField({ label = 'Password', ...props }: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <TextField
      {...props}
      label={label}
      type={revealed ? 'text' : 'password'}
      icon={<LockIcon />}
      trailing={
        <button
          type="button"
          aria-pressed={revealed}
          onClick={() => {
            setRevealed((previous) => !previous);
          }}
          className="text-koyi-muted hover:text-koyi-text rounded-koyi-sm focus-visible:outline-koyi-primary flex size-9 items-center justify-center transition-colors focus-visible:outline-2"
        >
          <span className="sr-only">{revealed ? 'Hide password' : 'Show password'}</span>
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
