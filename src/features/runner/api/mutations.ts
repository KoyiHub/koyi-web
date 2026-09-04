import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { runnerEndpoints } from '@/features/runner/api/endpoints';
import { runnerKeys } from '@/features/runner/api/queries';
import {
  type PutResponseInput,
  startSectionResponseSchema,
  submitSectionResponseSchema,
  type VerifyInput,
  verifyResponseSchema,
} from '@/features/runner/api/runner.schema';
import { runnerApi } from '@/lib/api/runner-client';
import { setSitting } from '@/lib/api/sitting-store';

/**
 * Every call the runner makes — `frontend-integration.md` §6. No refresh, no
 * token store: the credential is a sitting session (`@/lib/api/sitting-store`),
 * and a 401 anywhere means the sitting is over, handled globally by
 * `@/lib/api/runner-client`'s expiry handler rather than per-mutation.
 */

/**
 * The one place a child types anything. Verifying again **replaces** the
 * session — moving to another tablet ends the first one — and re-entering
 * codes after a drop is exactly how a sitting **resumes**, not restarts.
 */
export function useVerifySitting() {
  return useMutation({
    mutationFn: (input: VerifyInput) =>
      runnerApi.post(runnerEndpoints.verify, verifyResponseSchema, input),
    onSuccess: (data) => {
      setSitting({ session: data.session, expires_at: data.expires_at });
    },
  });
}

/**
 * Opens a section and returns its questions. **Does not restart the timer**
 * on a resumed sitting — the original `expires_at` stands (B.5). Options
 * carry no `is_correct`; the runner never receives the answer key.
 */
export function useStartSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      runnerApi.post(runnerEndpoints.startSection(sectionId), startSectionResponseSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runnerKeys.overview });
    },
  });
}

/** One answer. Safe to call on every change — it upserts. */
export function usePutResponse() {
  return useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: PutResponseInput }) =>
      runnerApi.put(runnerEndpoints.response(questionId), z.unknown(), input),
  });
}

/**
 * Finishes a section. **Submitting the last section finalises the paper on
 * its own** — there is no further submit call and no confirm step (§9).
 * `status: "finished"` means go straight to the summary screen.
 */
export function useSubmitSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      runnerApi.post(runnerEndpoints.submitSection(sectionId), submitSectionResponseSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runnerKeys.overview });
    },
  });
}
