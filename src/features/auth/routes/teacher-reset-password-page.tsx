import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { paths } from '@/config/paths';
import { useConfirmTeacherPasswordReset } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';
import { ApiError } from '@/lib/api/errors';

/**
 * Where a teacher's emailed reset link lands, at
 * "/login/teacher/reset-password?token=...". `frontend-integration.md` §5.1
 * — the token travels in the URL, not typed in by hand, so there is no
 * separate code-entry step the way the school admin flow has one.
 */
export function TeacherResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const confirm = useConfirmTeacherPasswordReset();

  if (!token) {
    return (
      <AuthCard
        title="This link isn't valid"
        subtitle="Reset links expire after a while, or may have already been used. Request a new one."
      >
        <Link
          to={paths.login.teacherForgotPassword}
          className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md inline-flex h-11 w-full items-center justify-center text-sm font-semibold text-white transition-colors"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    try {
      await confirm.mutateAsync({ token, password });
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
        ? 'That link may have expired. Please request a new one.'
        : null;

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="This replaces your current password immediately."
    >
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          error={confirmError ?? undefined}
        />
        <Button type="submit" className="mt-2 w-full" isLoading={confirm.isPending}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
