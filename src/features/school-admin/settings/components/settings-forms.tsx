import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { CheckCircleIcon, ShieldIcon } from '@/components/ui/icons';
import { PageSpinner } from '@/components/ui/page-spinner';
import { PasswordField } from '@/components/ui/password-field';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { gradesQuery, schoolQuery, sessionsQuery } from '@/features/school-admin/api/queries';
import { FormRow } from '@/features/school-admin/components/form-page';
import {
  useChangeAdminPassword,
  useUpdateAdminAccount,
  useUpdateSchoolProfile,
} from '@/features/school-admin/settings/api/mutations';
import { adminAccountQuery } from '@/features/school-admin/settings/api/queries';
import {
  adminAccountFormSchema,
  type AdminAccountFormValues,
  type ChangePasswordFormValues,
  changePasswordSchema,
  type SchoolProfileFormValues,
  schoolProfileSchema,
} from '@/features/school-admin/settings/schemas';
import { toApiError } from '@/lib/api/errors';

/** Checkbox with a bold label and an explanatory line, on a tinted panel. */
function CheckboxPanel({
  label,
  description,
  registration,
}: {
  label: string;
  description: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="bg-koyi-nav-active rounded-koyi-md border-koyi-primary border-l-4 p-4">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="border-koyi-border text-koyi-primary mt-0.5 size-4 shrink-0 rounded-sm"
          {...registration}
        />
        <span>
          <span className="text-koyi-text block text-sm font-bold">{label}</span>
          <span className="text-koyi-muted mt-1 block text-xs">{description}</span>
        </span>
      </label>
    </div>
  );
}

/** Save row shared by every settings form: error, success note, submit. */
function SaveRow({
  isSubmitting,
  errorMessage,
  successMessage,
  label = 'Save changes',
}: {
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  label?: string;
}) {
  return (
    <div className="border-koyi-border flex flex-wrap items-center justify-end gap-3 border-t pt-4">
      {errorMessage && (
        <p role="alert" className="text-koyi-danger mr-auto text-sm">
          {errorMessage}
        </p>
      )}
      {!errorMessage && successMessage && (
        <p
          role="status"
          className="text-koyi-band-strong-ink mr-auto inline-flex items-center gap-2 text-sm font-semibold"
        >
          <CheckCircleIcon aria-hidden="true" className="size-4" />
          {successMessage}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {label}
      </Button>
    </div>
  );
}

function QueryGate({
  isPending,
  error,
  onRetry,
  children,
}: {
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (isPending) return <PageSpinner />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */

export function SchoolProfileTab() {
  const school = useQuery(schoolQuery());
  const sessions = useQuery(sessionsQuery());
  const grades = useQuery(gradesQuery());
  const updateSchool = useUpdateSchoolProfile();

  return (
    <QueryGate
      isPending={school.isPending || sessions.isPending}
      error={school.isError ? school.error : sessions.isError ? sessions.error : null}
      onRetry={() => {
        void school.refetch();
        void sessions.refetch();
      }}
    >
      {school.data && sessions.data && (
        <div className="space-y-4">
          <SchoolProfileForm
            key={school.data.id}
            defaults={{
              name: school.data.name,
              email: school.data.email,
              phone: school.data.phone,
              address: school.data.address,
              location: school.data.location,
              motto: school.data.motto,
              currentSessionId: school.data.current_session.id,
            }}
            abbreviation={school.data.abbreviation}
            sessionOptions={sessions.data.map((session) => ({
              value: session.id,
              label: session.label,
            }))}
            isSubmitting={updateSchool.isPending}
            isSaved={updateSchool.isSuccess}
            errorMessage={updateSchool.isError ? toApiError(updateSchool.error).message : null}
            onSubmit={(values) => {
              updateSchool.mutate(values);
            }}
          />

          <Card
            title="Class system"
            subtitle="How this school labels its year groups. Set at registration and cannot be changed here."
          >
            <p className="text-koyi-text text-sm font-bold">
              {school.data.class_system === 'primary' ? 'Primary 1–6' : 'Grade 1–6'}
            </p>
            {grades.data && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {grades.data.map((grade) => (
                  <li
                    key={grade.id}
                    className="bg-koyi-nav-active text-koyi-primary rounded-full px-3 py-1 text-xs font-bold"
                  >
                    {grade.name}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </QueryGate>
  );
}

function SchoolProfileForm({
  defaults,
  abbreviation,
  sessionOptions,
  isSubmitting,
  isSaved,
  errorMessage,
  onSubmit,
}: {
  defaults: SchoolProfileFormValues;
  abbreviation: string;
  sessionOptions: { value: string; label: string }[];
  isSubmitting: boolean;
  isSaved: boolean;
  errorMessage: string | null;
  onSubmit: (values: SchoolProfileFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: defaults,
  });

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Card
        title="School profile"
        subtitle="Shown on reports, invitations and in the sidebar lockup."
      >
        <div className="space-y-4">
          <FormRow>
            <TextField label="School name *" error={errors.name?.message} {...register('name')} />
            <TextField
              label="School abbreviation"
              value={abbreviation}
              readOnly
              disabled
              hint="Set at registration. Prefixes every student and teacher ID this school issues — cannot be changed."
            />
          </FormRow>

          <FormRow>
            <TextField
              label="School email *"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Phone number *"
              type="tel"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </FormRow>

          <FormRow>
            <TextField label="Address *" error={errors.address?.message} {...register('address')} />
            <TextField
              label="Location *"
              hint="City and state, e.g. Abuja, FCT."
              error={errors.location?.message}
              {...register('location')}
            />
          </FormRow>

          <FormRow>
            <TextField
              label="Motto"
              hint="Optional. Appears on printed result sheets."
              error={errors.motto?.message}
              {...register('motto')}
            />
            <SelectField
              label="Current session *"
              options={sessionOptions}
              error={errors.currentSessionId?.message}
              {...register('currentSessionId')}
            />
          </FormRow>

          <SaveRow
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            successMessage={isSaved && !isDirty ? 'School profile saved.' : null}
          />
        </div>
      </Card>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function AccountSecurityTab() {
  const account = useQuery(adminAccountQuery());
  const updateAccount = useUpdateAdminAccount();

  return (
    <QueryGate
      isPending={account.isPending}
      error={account.isError ? account.error : null}
      onRetry={() => {
        void account.refetch();
      }}
    >
      {account.data && (
        <div className="space-y-4">
          <AccountForm
            key={account.data.id}
            defaults={{
              firstName: account.data.first_name,
              lastName: account.data.last_name,
              email: account.data.email,
              phone: account.data.phone,
              twoFactorEnabled: account.data.two_factor_enabled,
            }}
            emailVerified={account.data.email_verified}
            role={account.data.role}
            isSubmitting={updateAccount.isPending}
            isSaved={updateAccount.isSuccess}
            errorMessage={updateAccount.isError ? toApiError(updateAccount.error).message : null}
            onSubmit={(values) => {
              updateAccount.mutate(values);
            }}
          />

          <ChangePasswordForm />
        </div>
      )}
    </QueryGate>
  );
}

function AccountForm({
  defaults,
  emailVerified,
  role,
  isSubmitting,
  isSaved,
  errorMessage,
  onSubmit,
}: {
  defaults: AdminAccountFormValues;
  emailVerified: boolean;
  role: string;
  isSubmitting: boolean;
  isSaved: boolean;
  errorMessage: string | null;
  onSubmit: (values: AdminAccountFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AdminAccountFormValues>({
    resolver: zodResolver(adminAccountFormSchema),
    defaultValues: defaults,
  });

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Card
        title="Admin account"
        subtitle="Your own details on this school."
        action={
          <span className="bg-koyi-nav-active text-koyi-primary rounded-full px-3 py-1 text-xs font-bold">
            {role}
          </span>
        }
      >
        <div className="space-y-4">
          <FormRow>
            <TextField
              label="First name *"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Last name *"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </FormRow>

          <FormRow>
            <TextField
              label="Email *"
              type="email"
              autoComplete="email"
              hint={emailVerified ? 'Verified.' : 'Not verified — check your inbox for the link.'}
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Phone *"
              type="tel"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </FormRow>

          <CheckboxPanel
            label="Require a second factor at sign-in"
            description="Koyi sends a one-time code to your email each time you sign in from a new device."
            registration={register('twoFactorEnabled')}
          />

          <SaveRow
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            successMessage={isSaved && !isDirty ? 'Account saved.' : null}
          />
        </div>
      </Card>
    </form>
  );
}

function ChangePasswordForm() {
  const changePassword = useChangeAdminPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  return (
    <form
      noValidate
      onSubmit={(event) =>
        void handleSubmit((values) => {
          changePassword.mutate(values, {
            onSuccess: () => {
              reset();
            },
          });
        })(event)
      }
    >
      <Card
        title="Password"
        subtitle="Your current password is verified on the server before the change is applied."
        icon={<ShieldIcon className="size-4" />}
      >
        <div className="space-y-4">
          <PasswordField
            label="Current password *"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <FormRow>
            <PasswordField
              label="New password *"
              autoComplete="new-password"
              hint="At least 8 characters."
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <PasswordField
              label="Confirm new password *"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </FormRow>

          <SaveRow
            label="Update password"
            isSubmitting={changePassword.isPending}
            errorMessage={changePassword.isError ? toApiError(changePassword.error).message : null}
            successMessage={changePassword.isSuccess ? changePassword.data.detail : null}
          />
        </div>
      </Card>
    </form>
  );
}
