import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { schoolSchema } from '@/features/school-admin/api/shared.schema';
import { passwordChangeResponseSchema } from '@/features/school-admin/settings/api/settings.schema';
import { api } from '@/lib/api/client';

/**
 * §4.2 — `PATCH /v1/school/profile/`. `abbreviation` is never sent — read-only
 * after registration. `email`/`phone`/`address`/`location`/`motto` are gone —
 * the documented profile only has `name`, `logo` and `current_session`.
 */
export interface UpdateSchoolProfileInput {
  name: string;
  currentSessionId: string;
}

/** The school record shown across the app, including the sidebar lockup. */
export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSchoolProfileInput) =>
      api.patch(schoolAdminEndpoints.profile, schoolSchema, {
        name: input.name,
        current_session: input.currentSessionId,
      }),
    onSuccess: (data) => {
      // Write straight into the cache: the shell reads this on every screen.
      queryClient.setQueryData(schoolAdminKeys.profile(), data);
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
