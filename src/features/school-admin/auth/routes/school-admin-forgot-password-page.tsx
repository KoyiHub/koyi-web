import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckCircleIcon, MailIcon } from '@/components/ui/icons';
import { OtpInput } from '@/components/ui/otp-input';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { AuthCard } from '@/features/auth/components/auth-card';
import {
  useConfirmSchoolPasswordReset,
  useRequestSchoolPasswordReset,
  useVerifySchoolPasswordReset,
} from '@/features/school-admin/auth/api/mutations';
import { ApiError } from '@/lib/api/errors';

const CODE_LENGTH = 6;
type Stage = 'email' | 'code' | 'password' | 'done';

/**
 * School admin password reset at "/login/school-admin/forgot-password" —
 * `frontend-integration.md` §4.1. Three steps in one page, mirroring the
 * OTP-entry pattern already used by `verify-email-page.tsx` and
 * `school-admin-verify-device-page.tsx`: email → code → new password.
 *
 * The request step **always succeeds** from the visitor's point of view,
 * whether or not the address is registered — the copy says "if that
 * address is registered," never "code sent," so the form cannot be used to
 * discover which schools have accounts.
 */
export function SchoolAdminForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const request = useRequestSchoolPasswordReset();
  const verify = useVerifySchoolPasswordReset();
  const confirm = useConfirmSchoolPasswordReset();

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    await request.mutateAsync(email);
    setStage('code');
  }

  async function handleVerify(code: string) {
    try {
      const result = await verify.mutateAsync({ email, code });
      setResetToken(result.reset_token);
      setStage('password');
    } catch {
      // Surfaced via verify.error below.
    }
  }

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    try {
      await confirm.mutateAsync({ reset_token: resetToken, password });
      setStage('done');
    } catch {
      // Surfaced via confirm.error below.
    }
  }

  const verifyError =
    verify.error instanceof ApiError
      ? verify.error.message
      : verify.isError
        ? 'We could not verify that code. Please try again.'
        : null;

  const confirmError =
    confirm.error instanceof ApiError
      ? confirm.error.message
      : confirm.isError
        ? 'We could not reset your password. Please try again.'
        : null;

  if (stage === 'email') {
    return (
      <AuthCard
        title="Forgot your password?"
        subtitle="Enter your school email and, if it's registered, we'll send a code to reset your password."
      >
        <form onSubmit={(event) => void handleRequest(event)} className="flex flex-col gap-4">
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="admin@school.edu"
            icon={<MailIcon />}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
          <Button type="submit" className="mt-2 w-full" isLoading={request.isPending}>
            Send reset code
          </Button>
        </form>
        <p className="text-koyi-muted mt-6 text-center text-sm">
          <Link
            to={paths.login.schoolAdmin}
            className="text-koyi-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (stage === 'code') {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`If ${email} is registered, a ${String(CODE_LENGTH)}-digit code is on its way.`}
      >
        <OtpInput
          label="Reset code"
          length={CODE_LENGTH}
          value={code}
          onChange={setCode}
          onComplete={(value) => {
            void handleVerify(value);
          }}
          disabled={verify.isPending}
          error={verifyError ?? undefined}
        />
        <p className="text-koyi-muted mt-6 text-center text-sm">
          <Link
            to={paths.login.schoolAdmin}
            className="text-koyi-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (stage === 'password') {
    return (
      <AuthCard
        title="Choose a new password"
        subtitle="This replaces your current password immediately."
      >
        <form onSubmit={(event) => void handleConfirm(event)} className="flex flex-col gap-4">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            error={passwordError ?? confirmError ?? undefined}
          />
          <Button type="submit" className="mt-2 w-full" isLoading={confirm.isPending}>
            Reset password
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Password reset" subtitle="Your password has been changed.">
      <div className="flex flex-col items-center gap-4">
        <CheckCircleIcon className="text-koyi-success size-10" />
        <Link
          to={paths.login.schoolAdmin}
          className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md inline-flex h-11 w-full items-center justify-center text-sm font-semibold text-white transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
