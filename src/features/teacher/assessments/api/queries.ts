import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import {
  analyticsSchema,
  assessmentDetailSchema,
  assessmentListSchema,
  questionLayoutListSchema,
} from '@/features/teacher/assessments/api/assessment.schema';
import { api } from '@/lib/api/client';

export interface AssessmentListFilters {
  /** `all` | `literacy` | `numeracy` | `drafts` — the library's four tabs. */
  tab: string;
  search: string;
  difficulty: string;
  subject: string;
  status: string;
  grade: string;
  page: number;
}

/**
 * The assessment library. Filters go on the query string rather than being
 * applied in the browser, so paging stays correct once the list outgrows a
 * single page.
 */
export const assessmentListQuery = (filters: AssessmentListFilters) =>
  queryOptions({
    queryKey: teacherKeys.assessmentList(filters),
    queryFn: ({ signal }) => {
      const search = new URLSearchParams({ tab: filters.tab, page: String(filters.page) });
      if (filters.search) search.set('search', filters.search);
      if (filters.difficulty !== 'all') search.set('difficulty', filters.difficulty);
      if (filters.subject !== 'all') search.set('subject', filters.subject);
      if (filters.status !== 'all') search.set('status', filters.status);
      if (filters.grade !== 'all') search.set('grade', filters.grade);

      return api.get(
        `${teacherEndpoints.assessments.list}?${search.toString()}`,
        assessmentListSchema,
        { signal },
      );
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

/** One assessment with its results. Scores and bands arrive already computed. */
export const assessmentDetailQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: teacherKeys.assessmentDetail(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.detail(assessmentId), assessmentDetailSchema, {
        signal,
      }),
    staleTime: 60_000,
  });

/** The deeper report behind an assessment: distribution, skills, most-missed questions. */
export const assessmentAnalyticsQuery = (assessmentId: string) =>
  queryOptions({
    queryKey: teacherKeys.assessmentAnalytics(assessmentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.assessments.analytics(assessmentId), analyticsSchema, { signal }),
    staleTime: 60_000,
  });

/**
 * The `QuestionLayout` lookup table. Cached for the session — it is a small,
 * rarely-changing table that every question box in the builder reads.
 */
export const questionLayoutsQuery = () =>
  queryOptions({
    queryKey: teacherKeys.questionLayouts(),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.questionLayouts, questionLayoutListSchema, { signal }),
    staleTime: 30 * 60_000,
    select: (data) => data.results,
  });
