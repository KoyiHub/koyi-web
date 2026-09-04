import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { MailIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useRegisterSchool } from '@/features/landing/api/mutations';
import { StepActions } from '@/features/landing/components/step-actions';
import { StepHeader } from '@/features/landing/components/step-header';
import { type SchoolSetupFormValues, schoolSetupSchema } from '@/features/landing/schemas';
import { ApiError } from '@/lib/api/errors';

const CLASS_SYSTEM_OPTIONS = [
  { value: 'grade', label: 'Grade', hint: 'Grade 1 – Grade 6' },
  { value: 'primary', label: 'Primary', hint: 'Primary 1 – Primary 6' },
];

/**
 * Step 4 of the public journey, at "/get-started" — the first onboarding form.
 *
 * Fields match `frontend-integration.md` §4.1's register body exactly: name,
 * abbreviation, email, password, class system. Logo and the current session
 * are deliberately not here — the logo has no confirmed upload endpoint
 * anywhere, and the session is set later in school settings once the admin
 * is signed in.
 */
export function GetStartedPage() {
  const navigate = useNavigate();
  const registerSchool = useRegisterSchool();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolSetupFormValues>({
    resolver: zodResolver(schoolSetupSchema),
    defaultValues: {
      schoolName: '',
      schoolEmail: '',
      abbreviation: '',
      password: '',
      passwordConfirm: '',
      classSystem: 'primary',
    },
  });

  async function onSubmit(values: SchoolSetupFormValues) {
    try {
      await registerSchool.mutateAsync({
        name: values.schoolName,
        abbreviation: values.abbreviation,
        email: values.schoolEmail,
        password: values.password,
        password_confirm: values.passwordConfirm,
        class_system: values.classSystem,
      });

      await navigate(paths.landing.verifyEmail, {
        state: { name: values.schoolName, email: values.schoolEmail },
      });
    } catch {
      // Surfaced through `registerSchool.error` below.
    }
  }

  const errorMessage =
    registerSchool.error instanceof ApiError
      ? registerSchool.error.message
      : registerSchool.isError
        ? 'We could not set your school up. Please try again.'
        : null;

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
      <StepHeader
        stepKey="get-started"
        title="Let’s set up your school"
        subtitle="This creates your school on Koyi. You can invite teachers and add classes once you are inside."
      />

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="rounded-koyi-lg border-koyi-border bg-koyi-card mt-10 flex flex-col gap-5 border p-6 shadow-sm sm:p-8"
      >
        <TextField
          label="School name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Bright Future Academy"
          error={errors.schoolName?.message}
          {...register('schoolName')}
        />

        <TextField
          label="School email"
          type="email"
          autoComplete="email"
          placeholder="admin@yourschool.edu.ng"
          icon={<MailIcon />}
          error={errors.schoolEmail?.message}
          {...register('schoolEmail')}
        />

        <TextField
          label="School abbreviation"
          type="text"
          autoCapitalize="characters"
          placeholder="e.g. BFA"
          hint="2–12 letters or numbers. This cannot be changed later — it becomes the prefix on every student and teacher ID your school issues."
          error={errors.abbreviation?.message}
          {...register('abbreviation')}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PasswordField
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
          />
        </div>

        <Controller
          control={control}
          name="classSystem"
          render={({ field, fieldState }) => (
            <RadioCardGroup
              legend="Class system"
              name={field.name}
              options={CLASS_SYSTEM_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        {errorMessage && (
          <p role="alert" className="text-koyi-danger text-sm">
            {errorMessage}
          </p>
        )}

        <StepActions
          stepKey="get-started"
          nextLabel="Create school"
          isPending={registerSchool.isPending}
          className="mt-1"
        />
      </form>
    </section>
  );
}
