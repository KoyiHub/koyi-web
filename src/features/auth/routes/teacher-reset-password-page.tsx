import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { PasswordField } from '@/components/ui/password-field';
import { paths } from '@/config/paths';
import { useConfirmTeacherPasswordReset } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';
import { ApiError } from '@/lib/api/errors';

const CODE_LENGTH = 6;

/** Only the forgot-password request can produce a teacher id here, so it travels in route state. */
function readTeacherId(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) return null;
  const teacherId = (state as { teacherId?: unknown }).teacherId;
  return typeof teacherId === 'string' && teacherId.length > 0 ? teacherId : null;
}

/**
 * Where the teacher password reset flow lands at
 * "/login/teacher/reset-password" — `frontend-integration.md` §5.1. Code
 * and new password are entered together and spent in one `confirm` call —
 * there is no separate verify step and no `reset_token` the way the school
 * admin flow has one.
 */
export function TeacherResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const teacherId = readTeacherId(location.state);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const confirm = useConfirmTeacherPasswordReset();

  if (!teacherId) {
    return (
      <AuthCard
        title="Request a new code"
        subtitle="This page only works right after requesting a reset — start again below."
      >
        <Link
          to={paths.login.teacherForgotPassword}
          className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md inline-flex h-11 w-full items-center justify-center text-sm font-semibold text-white transition-colors"
        >
          Request a new code
        </Link>
      </AuthCard>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    try {
      await confirm.mutateAsync({
        teacherId: teacherId!,
        code,
        password,
        passwordConfirm: password,
      });
      void navigate(paths.login.teacher, {
        state: { successMessage: 'Password reset — sign in with your new password.' },
      });
    } catch {
      // Surfaced via confirmError below.
    }
  }

  const confirmError =
    confirm.error instanceof ApiError
      ? confirm.error.message
      : confirm.isError
        ? 'That code is incorrect or has expired.'
        : null;

  return (
    <AuthCard
      title="Choose a new password"
      subtitle={`Enter the ${String(CODE_LENGTH)}-digit code we emailed you, then set a new password.`}
    >
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
        <OtpInput
          label="Reset code"
          length={CODE_LENGTH}
          value={code}
          onChange={setCode}
          disabled={confirm.isPending}
          error={passwordError ? undefined : (confirmError ?? undefined)}
        />
        <PasswordField
          label="New password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          error={passwordError ?? undefined}
        />
        <Button
          type="submit"
          className="mt-2 w-full"
          isLoading={confirm.isPending}
          disabled={code.length !== CODE_LENGTH}
        >
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
