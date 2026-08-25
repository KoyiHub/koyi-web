import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { type SignupFormValues, signupSchema } from '@/features/auth/schemas';

/**
 * Frontend-only, provisional: no signup endpoint is confirmed yet. A valid
 * submit simulates a brief request and returns to /login — creating an
 * account does not imply an authenticated session without a real backend,
 * so this deliberately does not skip straight to the dashboard. Revisit
 * once account creation is API-backed.
 */
export function SignupPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    void navigate(paths.auth.login);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <span className="text-koyi-primary text-lg font-semibold tracking-tight lg:hidden">
          Koyi
        </span>
        <h1 className="text-koyi-text mt-2 text-2xl font-semibold">Create your account</h1>
        <p className="text-koyi-muted mt-1 text-sm">Set up your Koyi teacher account</p>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-4"
      >
        <TextField
          label="Full Name"
          type="text"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
          Sign up
        </Button>
      </form>

      <p className="text-koyi-muted mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link to={paths.auth.login} className="text-koyi-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
