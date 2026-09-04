import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckCircleIcon, IdCardIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useRequestTeacherPasswordReset } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';

/**
 * Teacher password reset request at "/login/teacher/forgot-password" —
 * `frontend-integration.md` §5.1. **Link-based, not OTP-code based**: this
 * emails a reset link, so the page's job ends the moment the request
 * succeeds — there is no code to enter here.
 *
 * Always resolves from the teacher's point of view, whether or not the id
 * is registered, so the form cannot be used to discover which teacher ids
 * exist.
 */
export function TeacherForgotPasswordPage() {
  const [teacherId, setTeacherId] = useState('');
  const [sent, setSent] = useState(false);
  const request = useRequestTeacherPasswordReset();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await request.mutateAsync(teacherId);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If that Teacher ID is registered, we've emailed a link to reset your password."
      >
        <div className="flex flex-col items-center gap-4">
          <CheckCircleIcon className="text-koyi-success size-10" />
          <Link
            to={paths.login.teacher}
            className="text-koyi-primary text-sm font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your Teacher ID and, if it's registered, we'll email you a link to reset your password."
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
          Send reset link
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
