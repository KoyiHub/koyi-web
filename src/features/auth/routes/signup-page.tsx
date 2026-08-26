import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { LockIcon, MailIcon, UserIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useRegister } from '@/features/auth/api/mutations';
import { type SignupFormValues, signupSchema } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

/**
 * The backend stores first/last name separately, but the form (matching the
 * approved design) collects one "Full Name" field. Split on the first space —
 * `last_name` is blank-allowed on the backend, so a single-word name is fine.
 */
function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const [first_name = '', ...rest] = fullName.trim().split(/\s+/);
  return { first_name, last_name: rest.join(' ') };
}

export function SignupPage() {
  const navigate = useNavigate();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  // Registration never authenticates the caller (confirmed against
  // `RegisterView`, which returns only the created user, no tokens) — send
  // them to /login to sign in for real.
  async function onSubmit(values: SignupFormValues) {
    try {
      await register_.mutateAsync({
        email: values.email,
        password: values.password,
        password_confirm: values.confirmPassword,
        ...splitFullName(values.fullName),
      });
      void navigate(paths.auth.login, {
        state: { successMessage: 'Account created. You can now log in.' },
      });
    } catch {
      // Surfaced via register_.error below.
    }
  }

  const errorMessage =
    register_.error instanceof ApiError
      ? register_.error.message
      : register_.isError
        ? 'Account creation failed.'
        : null;

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-koyi-text text-2xl font-semibold">Create Your Teacher Account</h1>
        <p className="text-koyi-muted mt-1 text-sm">
          Start helping your students learn and grow with Koyi.
        </p>
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
          icon={<UserIcon />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {errorMessage && (
          <p role="alert" className="text-koyi-danger text-sm">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          className="mt-2 w-full"
          isLoading={register_.isPending}
          disabled={register_.isPending}
        >
          Create Account
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
