import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import {
  type BankQuestionFilters,
  bankQuestionListSchema,
  bankQuestionSchema,
  skillListSchema,
} from '@/features/teacher/bank/api/bank.schema';
import { api } from '@/lib/api/client';

export const bankKeys = {
  all: ['teacher', 'bank'] as const,
  skills: (domain?: string) => [...bankKeys.all, 'skills', domain ?? 'all'] as const,
  questions: (filters: BankQuestionFilters) => [...bankKeys.all, 'questions', filters] as const,
  question: (id: string) => [...bankKeys.all, 'question', id] as const,
};

/**
 * The taxonomy. Unpaginated — 14 skills and 55 subskills is small enough that
 * paging would only add a round trip.
 *
 * Held for a long time: it is reference data that changes with a release, not
 * with a teacher's work.
 */
export const skillsQuery = (domain?: string) =>
  queryOptions({
    queryKey: bankKeys.skills(domain),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.bank.skills, skillListSchema, {
        signal,
        params: domain ? { domain } : undefined,
      }),
    staleTime: 60 * 60 * 1000,
  });

export const bankQuestionsQuery = (filters: BankQuestionFilters = {}) =>
  queryOptions({
    queryKey: bankKeys.questions(filters),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.bank.questions, bankQuestionListSchema, {
        signal,
        params: filters,
      }),
  });

/** One bank question, fetched to prefill the authoring form. */
export const bankQuestionQuery = (questionId: string) =>
  queryOptions({
    queryKey: bankKeys.question(questionId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.bank.question(questionId), bankQuestionSchema, { signal }),
  });
