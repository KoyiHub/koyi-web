import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import {
  bankListSchema,
  bankSummarySchema,
} from '@/features/teacher/bank/api/question-bank.schema';
import { api } from '@/lib/api/client';

export interface BankFilters {
  search: string;
  subject: string;
  /** `all`, or a `QuestionType`. The bank's most useful filter when building. */
  questionType: string;
  level: string;
  page: number;
}

/** Bank questions, filtered server-side so paging stays correct. */
export const questionBankQuery = (filters: BankFilters) =>
  queryOptions({
    queryKey: teacherKeys.questionBankList(filters),
    queryFn: ({ signal }) => {
      const search = new URLSearchParams({ page: String(filters.page) });
      if (filters.search) search.set('search', filters.search);
      if (filters.subject !== 'all') search.set('subject', filters.subject);
      if (filters.questionType !== 'all') search.set('question_type', filters.questionType);
      if (filters.level !== 'all') search.set('level', filters.level);

      return api.get(`${teacherEndpoints.questionBank.list}?${search.toString()}`, bankListSchema, {
        signal,
      });
    },
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

/** Counts for the filter rail. Kept separate so filtering never restates its own totals. */
export const questionBankSummaryQuery = () =>
  queryOptions({
    queryKey: teacherKeys.questionBankSummary(),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.questionBank.summary, bankSummarySchema, { signal }),
    staleTime: 10 * 60_000,
  });
