import { queryOptions } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { schoolAssessmentListSchema } from '@/features/school-admin/assessments/api/assessment.schema';
import { api } from '@/lib/api/client';

export interface AssessmentListFilters {
  page: number;
}

/** §4.8 — paginated. School-wide oversight, not authoring. */
export const schoolAssessmentListQuery = (filters: AssessmentListFilters) =>
  queryOptions({
    queryKey: schoolAdminKeys.assessmentList(filters),
    queryFn: ({ signal }) =>
      api.get(schoolAdminEndpoints.assessments, schoolAssessmentListSchema, {
        params: { page: filters.page },
        signal,
      }),
    placeholderData: (previous) => previous,
  });
