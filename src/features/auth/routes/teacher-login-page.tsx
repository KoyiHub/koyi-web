import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { BuildingIcon, IdCardIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useTeacherLogin } from '@/features/auth/api/mutations';
import { AuthCard } from '@/features/auth/components/auth-card';
import { ForgotPasswordLink } from '@/features/auth/components/forgot-password-link';
import {
  forgetSchoolId,
  getRememberedSchoolId,
  rememberSchoolId,
} from '@/features/auth/lib/school-id-store';
import { type TeacherLoginFormValues, teacherLoginSchema } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api/errors';

/**
 * Teacher sign-in at "/login/teacher". Teachers do not register themselves —
 * their school issues a Teacher ID — so the credential pair is
 * (Teacher ID, School ID) plus a password.
 *
 * The School ID is remembered on the device after a successful sign-in and
 * prefilled next time. It stays a visible, editable field: staff-room devices
 * are shared, and a hidden field nobody can correct is worse than one extra
 * prefilled box.
 */
export function TeacherLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useTeacherLogin();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const rememberedSchoolId = getRememberedSchoolId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherLoginFormValues>({
    resolver: zodResolver(teacherLoginSchema),
    defaultValues: {
      teacherId: '',
      schoolId: rememberedSchoolId ?? '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values: TeacherLoginFormValues) {
    try {
      const result = await login.mutateAsync({
        teacherId: values.teacherId,
        schoolId: values.schoolId,
        password: values.password,
      });

      // Remember the School ID the backend accepted, not the typed one, so a
      // corrected or normalised value is what comes back next time.
      if (values.rememberMe) {
        rememberSchoolId(result.school_id);
      } else {
        forgetSchoolId();
      }

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
          placeholder="TCH-2016-031"
          autoComplete="username"
          icon={<IdCardIcon />}
          error={errors.teacherId?.message}
          {...register('teacherId')}
        />

        <TextField
          label="School ID"
          placeholder="KOY-SCH-0042"
          autoComplete="organization"
          icon={<BuildingIcon className="size-4 fill-none stroke-current stroke-2" />}
          error={errors.schoolId?.message}
          hint={
            rememberedSchoolId
              ? 'Saved from your last sign-in on this device — change it if you are signing in for a different school.'
              : 'Your school administrator has this.'
          }
          {...register('schoolId')}
        />

        <PasswordField
          autoComplete="current-password"
          labelAction={<ForgotPasswordLink />}
          error={errors.password?.message}
          {...register('password')}
        />

        <label className="text-koyi-text flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="border-koyi-border text-koyi-primary size-4 rounded-sm"
            {...register('rememberMe')}
          />
          Remember my School ID on this device
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
        <Link
          to={paths.teacher.auth.signup}
          className="text-koyi-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
