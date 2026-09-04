import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { schoolSchema } from '@/features/school-admin/api/shared.schema';
import {
  adminAccountSchema,
  passwordChangeResponseSchema,
} from '@/features/school-admin/settings/api/settings.schema';
import { api } from '@/lib/api/client';

/** §4.2 — `PATCH /v1/school/profile/`. `abbreviation` is never sent — read-only after registration. */
export interface UpdateSchoolProfileInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  motto: string;
  currentSessionId: string;
}

/** The school record shown across the app, including the sidebar lockup. */
export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSchoolProfileInput) =>
      api.patch(schoolAdminEndpoints.profile, schoolSchema, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        location: input.location,
        motto: input.motto,
        current_session: input.currentSessionId,
      }),
    onSuccess: (data) => {
      // Write straight into the cache: the shell reads this on every screen.
      queryClient.setQueryData(schoolAdminKeys.profile(), data);
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
      api.patch(schoolAdminEndpoints.account, adminAccountSchema, {
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

/** Password change for the signed-in administrator — `frontend-integration.md` §4.2. */
export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (input: ChangeAdminPasswordInput) =>
      api.post(schoolAdminEndpoints.profilePassword, passwordChangeResponseSchema, {
        current_password: input.currentPassword,
        new_password: input.newPassword,
        confirm_password: input.confirmPassword,
      }),
  });
}
