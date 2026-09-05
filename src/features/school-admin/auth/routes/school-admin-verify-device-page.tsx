import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { paths } from '@/config/paths';
import { AuthCard } from '@/features/auth/components/auth-card';
import { useSchoolAdminVerifyDevice } from '@/features/school-admin/auth/api/mutations';
import {
  DEVICE_CODE_LENGTH,
  type SchoolAdminVerifyDeviceFormValues,
  schoolAdminVerifyDeviceSchema,
} from '@/features/school-admin/auth/schemas';
import { ApiError } from '@/lib/api/errors';

interface DeviceChallenge {
  challenge: string;
  email: string;
}

/** Only a login response can produce a challenge, so it travels in route state. */
function readChallenge(state: unknown): DeviceChallenge | null {
  if (typeof state !== 'object' || state === null) return null;
  const candidate = state as Partial<DeviceChallenge>;
  if (typeof candidate.challenge !== 'string' || typeof candidate.email !== 'string') return null;
  return { challenge: candidate.challenge, email: candidate.email };
}

/**
 * Device check at "/login/verify-device", reached only when a School Admin
 * login came back with `verification_required: true` — an unrecognised device
 * or a missing trust cookie. No tokens exist yet at this point; clearing the
 * code is what issues them.
 */
export function SchoolAdminVerifyDevicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = readChallenge(location.state);
  const verify = useSchoolAdminVerifyDevice();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolAdminVerifyDeviceFormValues>({
    resolver: zodResolver(schoolAdminVerifyDeviceSchema),
    defaultValues: { code: '' },
  });

  // Arriving without a challenge (a refresh, or a pasted URL) means there is
  // nothing to verify — send the admin back to sign in rather than showing a
  // code box that can never succeed.
  if (!challenge) {
    return <Navigate to={paths.login.schoolAdmin} replace />;
  }

  async function onSubmit(values: SchoolAdminVerifyDeviceFormValues) {
    if (!challenge) return;
    try {
      await verify.mutateAsync({ challenge: challenge.challenge, code: values.code });
      void navigate(paths.schoolAdmin.dashboard);
    } catch {
      // Surfaced via `verifyError` below.
    }
  }

  const verifyError =
    verify.error instanceof ApiError
      ? verify.error.message
      : verify.isError
        ? 'We could not verify that code. Please try again.'
        : null;

  return (
    <AuthCard
      title="Check this device"
      subtitle={`We don’t recognise this device, so we sent a ${String(DEVICE_CODE_LENGTH)}-digit code to ${challenge.email}.`}
    >
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-5"
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              label="Verification code"
              length={DEVICE_CODE_LENGTH}
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

        <Button
          type="submit"
          className="w-full"
          isLoading={verify.isPending}
          disabled={verify.isPending}
        >
          Verify and continue
        </Button>
      </form>

      <p className="text-koyi-muted mt-6 text-center text-sm">
        Wrong account?{' '}
        <Link
          to={paths.login.schoolAdmin}
          className="text-koyi-primary font-medium hover:underline"
        >
          Sign in again
        </Link>
      </p>
    </AuthCard>
  );
}
