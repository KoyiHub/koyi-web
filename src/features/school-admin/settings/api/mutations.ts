import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { schoolSchema } from '@/features/school-admin/api/shared.schema';
import {
  academicSettingsSchema,
  adminAccountSchema,
  passwordChangeResponseSchema,
} from '@/features/school-admin/settings/api/settings.schema';
import { api } from '@/lib/api/client';

export interface UpdateSchoolProfileInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  motto: string;
}

/** The school record shown across the app, including the sidebar lockup. */
export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSchoolProfileInput) =>
      api.patch(schoolAdminEndpoints.school, schoolSchema, input),
    onSuccess: (data) => {
      // Write straight into the cache: the shell reads this on every screen.
      queryClient.setQueryData(schoolAdminKeys.school(), data);
    },
  });
}

export interface UpdateAcademicSettingsInput {
  currentSession: string;
  currentTerm: string;
  termStartsOn: string;
  termEndsOn: string;
  assessmentWindowWeeks: number;
  autoAssignBaseline: boolean;
}

export function useUpdateAcademicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAcademicSettingsInput) =>
      api.patch(schoolAdminEndpoints.settings.academic, academicSettingsSchema, {
        current_session: input.currentSession,
        current_term: input.currentTerm,
        term_starts_on: input.termStartsOn,
        term_ends_on: input.termEndsOn,
        assessment_window_weeks: input.assessmentWindowWeeks,
        auto_assign_baseline: input.autoAssignBaseline,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(schoolAdminKeys.academicSettings(), data);
    },
  });
}

export interface UpdateAdminAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
}

export function useUpdateAdminAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminAccountInput) =>
      api.patch(schoolAdminEndpoints.settings.account, adminAccountSchema, {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        two_factor_enabled: input.twoFactorEnabled,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(schoolAdminKeys.accountSettings(), data);
    },
  });
}

export interface ChangeAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Password change for the signed-in administrator. Verified server-side. */
export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (input: ChangeAdminPasswordInput) =>
      api.post(schoolAdminEndpoints.settings.accountPassword, passwordChangeResponseSchema, {
        current_password: input.currentPassword,
        new_password: input.newPassword,
        confirm_password: input.confirmPassword,
      }),
  });
}
