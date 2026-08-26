import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { LockIcon, MailIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useLogin } from '@/features/auth/api/mutations';
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login.mutateAsync(values);
      void navigate(paths.dashboard);
    } catch {
      // Surfaced via login.error below — nothing further to do here.
    }
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.isError ? 'Log in failed.' : null;

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-koyi-text text-2xl font-semibold">Welcome Back</h1>
        <p className="text-koyi-muted mt-1 text-sm">
          Sign in to continue to your school teaching dashboard.
        </p>
      </div>

      {successMessage && (
        <p role="status" className="text-koyi-primary mb-4 text-sm">
          {successMessage}
        </p>
      )}

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-4"
      >
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            icon={<LockIcon />}
            error={errors.password?.message}
            {...register('password')}
          />
          <span
            aria-disabled="true"
            title="Not available yet"
            className="text-koyi-primary absolute top-0 right-0 cursor-not-allowed text-sm font-medium opacity-70"
          >
            Forgot password?
          </span>
        </div>

        <label className="text-koyi-text flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-koyi-border text-koyi-primary size-4 rounded-sm"
          />
          Remember me
        </label>

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
        Don&apos;t have an account?{' '}
        <Link to={paths.auth.signup} className="text-koyi-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
