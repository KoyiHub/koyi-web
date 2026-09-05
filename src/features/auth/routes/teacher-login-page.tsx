import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { IdCardIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useTeacherLogin } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';
import { ForgotPasswordLink } from '@/features/auth/components/forgot-password-link';
import { type TeacherLoginFormValues, teacherLoginSchema } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

/**
 * Teacher sign-in at "/login/teacher".
 *
 * **One identifier and a password.** A teacher signs in with the id their
 * school issued them — `GHS-T-00007` — which carries the school's abbreviation
 * as a prefix and is globally unique, so there is no school field to fill in
 * and nothing to remember between visits.
 *
 * There is no "sign up" link. Teachers do not self-register: a school admin
 * creates the account, and that is what ties the login to a school.
 *
 * SECURITY: a wrong password, an unknown id and a disabled account all come
 * back as the same `401` with the same message. That sameness is the point — it
 * stops the form being used to discover which teacher ids exist — so the
 * server's message is shown verbatim and never decorated with a hint about
 * which half was wrong.
 */
export function TeacherLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useTeacherLogin();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: { teacherId: '', password: '' },
  });

  async function onSubmit(values: TeacherLoginFormValues) {
    try {
      await login.mutateAsync({
        teacherId: values.teacherId,
        password: values.password,
      });
      void navigate(paths.teacher.dashboard);
    } catch {
      // Surfaced via login.error below — nothing further to do here.
    }
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.isError ? 'Log in failed.' : null;

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your school teaching dashboard."
    >
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
          label="Teacher ID"
          placeholder="GHS-T-00007"
          autoComplete="username"
          autoCapitalize="characters"
          icon={<IdCardIcon />}
          error={errors.teacherId?.message}
          hint="The ID your school issued you. It is not your email address."
          {...register('teacherId')}
        />

        <PasswordField
          autoComplete="current-password"
          labelAction={<ForgotPasswordLink to={paths.login.teacherForgotPassword} />}
          error={errors.password?.message}
          {...register('password')}
        />

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
        Teacher accounts are created by your school administrator. Ask them if you do not have your
        Teacher ID.
      </p>
    </AuthCard>
  );
}
