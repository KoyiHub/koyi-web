import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { OtpInput } from '@/components/ui/otp-input';
import { paths } from '@/config/paths';
import { useResendVerification, useVerifyEmail } from '@/features/landing/api/mutations';
import { StepActions } from '@/features/landing/components/step-actions';
import { StepHeader } from '@/features/landing/components/step-header';
import { readJourneyState } from '@/features/landing/lib/journey-state';
import {
  VERIFICATION_CODE_LENGTH,
  type VerifyEmailFormValues,
  verifyEmailSchema,
} from '@/features/landing/schemas';
import { ApiError } from '@/lib/api/errors';

/** Step 5 of the public journey, at "/verify-email". */
export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const school = readJourneyState(location.state);

  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [cooldown, setCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((seconds) => seconds - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    if (school) setFocus('code');
  }, [school, setFocus]);

  // Arriving here without a school (a refresh, or a pasted URL) means there is
  // nothing to verify — send the visitor back to set-up rather than showing a
  // code box that can never succeed.
  if (!school) {
    return <Navigate to={paths.landing.getStarted} replace />;
  }

  async function onSubmit(values: VerifyEmailFormValues) {
    if (!school) return;
    try {
      await verify.mutateAsync({ schoolId: school.schoolId, code: values.code });
      await navigate(paths.landing.ready, { state: school });
    } catch {
      // Surfaced through `verify.error` below.
    }
  }

  async function handleResend() {
    if (!school || cooldown > 0) return;
    try {
      const result = await resend.mutateAsync({ schoolId: school.schoolId });
      setCooldown(result.retryAfterSeconds);
    } catch {
      // Surfaced through `resend.error` below.
    }
  }

  const verifyError =
    verify.error instanceof ApiError
      ? verify.error.message
      : verify.isError
        ? 'We could not verify that code. Please try again.'
        : null;

  const resendError =
    resend.error instanceof ApiError
      ? resend.error.message
      : resend.isError
        ? 'We could not send a new code. Please try again.'
        : null;

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
      <StepHeader
        stepKey="verify-email"
        title="Verify your school email"
        subtitle={`We sent a ${String(VERIFICATION_CODE_LENGTH)}-digit code to ${school.schoolEmail}. Enter it below to confirm the address belongs to ${school.schoolName}.`}
      />

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="rounded-koyi-lg border-koyi-border bg-koyi-card mt-10 flex flex-col gap-5 border p-6 shadow-sm sm:p-8"
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              label="Verification code"
              length={VERIFICATION_CODE_LENGTH}
              value={field.value}
              onChange={field.onChange}
              onComplete={() => {
                void handleSubmit(onSubmit)();
              }}
              disabled={verify.isPending}
              error={errors.code?.message ?? verifyError ?? undefined}
            />
          )}
        />

        <div className="text-koyi-muted flex flex-wrap items-center gap-1 text-sm">
          <span>Didn’t get the code?</span>
          <button
            type="button"
            onClick={() => {
              void handleResend();
            }}
            disabled={cooldown > 0 || resend.isPending}
            className="text-koyi-primary font-medium hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend in ${String(cooldown)}s` : 'Send it again'}
          </button>
        </div>

        {resend.isSuccess && cooldown > 0 && (
          <p role="status" className="text-koyi-success text-sm">
            A new code is on its way to {school.schoolEmail}.
          </p>
        )}

        {resendError && (
          <p role="alert" className="text-koyi-danger text-sm">
            {resendError}
          </p>
        )}

        <StepActions
          stepKey="verify-email"
          nextLabel="Verify email"
          isPending={verify.isPending}
          className="mt-1"
        />
      </form>
    </section>
  );
}
