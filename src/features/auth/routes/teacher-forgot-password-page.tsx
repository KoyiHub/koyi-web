import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { IdCardIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useRequestTeacherPasswordReset } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';

/**
 * Teacher password reset request at "/login/teacher/forgot-password" —
 * `frontend-integration.md` §5.1. Code-based, like the school admin flow:
 * this emails a six-digit code, then hands off to the reset page (the
 * teacher id travels in route state, not a URL token).
 *
 * Always resolves from the teacher's point of view, whether or not the id
 * is registered, so the form cannot be used to discover which teacher ids
 * exist.
 */
export function TeacherForgotPasswordPage() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');
  const request = useRequestTeacherPasswordReset();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await request.mutateAsync(teacherId);
    void navigate(paths.login.teacherResetPassword, { state: { teacherId } });
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your Teacher ID and, if it's registered, we'll email you a code to reset your password."
    >
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
        <TextField
          label="Teacher ID"
          placeholder="GHS-T-00007"
          autoComplete="username"
          autoCapitalize="characters"
          icon={<IdCardIcon />}
          required
          value={teacherId}
          onChange={(event) => {
            setTeacherId(event.target.value);
          }}
        />
        <Button type="submit" className="mt-2 w-full" isLoading={request.isPending}>
          Send reset code
        </Button>
      </form>
      <p className="text-koyi-muted mt-6 text-center text-sm">
        <Link to={paths.login.teacher} className="text-koyi-primary font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
