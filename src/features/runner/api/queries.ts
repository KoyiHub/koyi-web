import { queryOptions } from '@tanstack/react-query';

import { runnerEndpoints } from '@/features/runner/api/endpoints';
import { assessmentOverviewSchema } from '@/features/runner/api/runner.schema';
import { runnerApi } from '@/lib/api/runner-client';

export const runnerKeys = {
  overview: ['runner', 'overview'] as const,
};

/**
 * The instruction hub's source of truth — which section is next, which are
 * locked, which are already submitted. Refetched after every section submit
 * so the hub always reflects the server, never a locally-guessed state.
 */
export const assessmentOverviewQuery = () =>
  queryOptions({
    queryKey: runnerKeys.overview,
    queryFn: ({ signal }) =>
      runnerApi.get(runnerEndpoints.overview, assessmentOverviewSchema, { signal }),
  });
