import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PasswordField } from '@/components/ui/password-field';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { useResetTeacherPassword } from '@/features/school-admin/teachers/api/mutations';
import { toApiError } from '@/lib/api/errors';

type Mode = 'generate' | 'manual';

const MODE_OPTIONS = [
  {
    value: 'generate',
    label: 'Generate a temporary password',
    hint: 'The server creates one. It is shown once, and the teacher must change it at next login.',
  },
  {
    value: 'manual',
    label: 'Set the password myself',
    hint: 'Use this when you are handing the teacher their password in person.',
  },
];

interface ResetPasswordModalProps {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

/**
 * Password reset, the admin's choice of mode.
 *
 * A generated password comes from the server — the browser never invents a
 * credential — and is echoed back exactly once so it can be handed over. A
 * manually set password is never echoed back at all.
 *
 * The caller mounts this only while the dialog is open, so every opening
 * starts clean — no stale generated password is left on screen.
 */
export function ResetPasswordModal({ teacherId, teacherName, onClose }: ResetPasswordModalProps) {
  const [mode, setMode] = useState<Mode>('generate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetPassword = useResetTeacherPassword();

  const result = resetPassword.data;
  const errorMessage =
    validationError ?? (resetPassword.isError ? toApiError(resetPassword.error).message : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (mode === 'manual') {
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
      resetPassword.mutate({ teacherId, mode: 'manual', password, confirmPassword });
      return;
    }

    resetPassword.mutate({ teacherId, mode: 'generate' });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Reset password"
      description={`Issue a new password for ${teacherName}. Their current password stops working immediately.`}
    >
      {result ? (
        <div className="space-y-4">
          <div className="bg-koyi-band-strong-soft rounded-koyi-lg p-4">
            <p className="text-koyi-band-strong-ink text-sm font-bold">Password reset.</p>
            <p className="text-koyi-text mt-1 text-sm">
              {result.temporary_password
                ? 'Copy this temporary password now — it will not be shown again.'
                : 'The password you set is now active.'}
            </p>
            {result.temporary_password && (
              <p className="bg-koyi-card border-koyi-border text-koyi-text mt-3 rounded-md border px-3 py-2 font-mono text-sm break-all">
                {result.temporary_password}
              </p>
            )}
            {result.must_change_on_next_login && (
              <p className="text-koyi-muted mt-2 text-xs">
                {teacherName} will be asked to choose a new password at their next login.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <RadioCardGroup
            legend="How should the new password be set?"
            name="reset-mode"
            options={MODE_OPTIONS}
            value={mode}
            onChange={(value) => {
              setMode(value as Mode);
              setValidationError(null);
            }}
          />

          {mode === 'manual' && (
            <div className="space-y-4">
              <PasswordField
                label="New password"
                autoComplete="new-password"
                value={password}
                hint="At least 8 characters."
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                }}
              />
            </div>
          )}

          {errorMessage && (
            <p role="alert" className="text-koyi-danger text-sm">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={resetPassword.isPending}>
              Reset password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
