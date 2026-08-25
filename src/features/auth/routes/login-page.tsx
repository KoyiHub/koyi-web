import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas';

/**
 * Frontend-only, provisional: no login endpoint is confirmed yet. A valid
 * submit simulates a brief request and navigates straight to the dashboard.
 * No token is issued or stored — see CURRENT.md.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    void navigate(paths.dashboard);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <span className="text-koyi-primary text-lg font-semibold tracking-tight lg:hidden">
          Koyi
        </span>
        <h1 className="text-koyi-text mt-2 text-2xl font-semibold">Welcome back</h1>
        <p className="text-koyi-muted mt-1 text-sm">Log in to your Koyi teacher account</p>
      </div>

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
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <span
            aria-disabled="true"
            title="Not available yet"
            className="text-koyi-muted cursor-not-allowed text-sm"
          >
            Forgot password?
          </span>
        </div>

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
          Log in
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
