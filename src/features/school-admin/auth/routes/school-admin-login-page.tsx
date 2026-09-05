import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { MailIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { AuthCard } from '@/features/auth/components/auth-card';
import { ForgotPasswordLink } from '@/features/auth/components/forgot-password-link';
import { useSchoolAdminLogin } from '@/features/school-admin/auth/api/mutations';
import {
  type SchoolAdminLoginFormValues,
  schoolAdminLoginSchema,
} from '@/features/school-admin/auth/schemas';
import { ApiError } from '@/lib/api/errors';

/**
 * School Admin sign-in at "/login/school-admin".
 *
 * The backend decides whether this device needs a second step: a response
 * with `verification_required: true` carries a challenge instead of tokens,
 * and we hand off to the device check. The client never makes that call
 * itself — it only reacts to the flag.
 */
export function SchoolAdminLoginPage() {
  const navigate = useNavigate();
  const login = useSchoolAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolAdminLoginFormValues>({
    resolver: zodResolver(schoolAdminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: SchoolAdminLoginFormValues) {
    try {
      const result = await login.mutateAsync(values);

      if (result.otp_required) {
        // The guide's challenge response carries no email — the admin just
        // typed it, so it travels in route state from here rather than
        // waiting to be echoed back.
        void navigate(paths.login.verifyDevice, {
          state: { challenge: result.challenge, email: values.email },
        });
        return;
      }

      void navigate(paths.schoolAdmin.dashboard);
    } catch {
      // Surfaced via login.error below.
    }
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.isError ? 'Log in failed.' : null;

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to manage your school with Koyi.">
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-4"
      >
        <TextField
          label="Email Address"
          type="email"
          placeholder="admin@school.edu"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <ForgotPasswordLink to={paths.login.schoolAdminForgotPassword} />
        </div>

        {errorMessage && (
          <p role="alert" className="text-koyi-danger text-sm">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          className="mt-2 w-full"
          isLoading={login.isPending}
          disabled={login.isPending}
        >
          Log In
        </Button>
      </form>

      <p className="text-koyi-muted mt-6 text-center text-sm">
        Don&apos;t have a school account?{' '}
        <Link
          to={paths.landing.getStarted}
          className="text-koyi-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
