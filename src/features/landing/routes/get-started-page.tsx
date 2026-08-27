import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { FileDropField } from '@/components/ui/file-drop-field';
import { LockIcon, MailIcon } from '@/components/ui/icons';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useRegisterSchool } from '@/features/landing/api/mutations';
import { StepActions } from '@/features/landing/components/step-actions';
import { StepHeader } from '@/features/landing/components/step-header';
import {
  academicSessionOptions,
  currentSessionValue,
} from '@/features/landing/lib/academic-sessions';
import {
  LOGO_ACCEPT,
  LOGO_MAX_BYTES,
  type SchoolSetupFormValues,
  schoolSetupSchema,
} from '@/features/landing/schemas';
import { ApiError } from '@/lib/api/errors';

const CLASS_SYSTEM_OPTIONS = [
  { value: 'grade', label: 'Grade', hint: 'Grade 1 – Grade 6' },
  { value: 'primary', label: 'Primary', hint: 'Primary 1 – Primary 6' },
];

/**
 * Step 4 of the public journey, at "/get-started" — the first onboarding form.
 *
 * Layout: the two identifying fields sit full width, then password and session
 * pair up on a row (both short), with the class-system cards and the logo
 * dropzone given their own width because each is taller than a text input.
 */
export function GetStartedPage() {
  const navigate = useNavigate();
  const registerSchool = useRegisterSchool();
  const sessionOptions = academicSessionOptions();

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
      schoolLogo: null,
      password: '',
      classSystem: 'primary',
      currentSession: currentSessionValue(),
    },
  });

  async function onSubmit(values: SchoolSetupFormValues) {
    try {
      const school = await registerSchool.mutateAsync({
        schoolName: values.schoolName,
        schoolEmail: values.schoolEmail,
        password: values.password,
        classSystem: values.classSystem,
        currentSession: values.currentSession,
        logoFileName: values.schoolLogo?.name,
      });

      await navigate(paths.landing.verifyEmail, {
        state: {
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          schoolEmail: school.schoolEmail,
        },
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

        <Controller
          control={control}
          name="schoolLogo"
          render={({ field, fieldState }) => (
            <FileDropField
              label="School logo"
              optional
              accept={LOGO_ACCEPT}
              maxBytes={LOGO_MAX_BYTES}
              hint="PNG, JPG or SVG, up to 2MB"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            icon={<LockIcon />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Controller
            control={control}
            name="currentSession"
            render={({ field, fieldState }) => (
              <SelectField
                label="Current session"
                options={sessionOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={fieldState.error?.message}
              />
            )}
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
