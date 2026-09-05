import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import { studentSkillsSchema } from '@/features/teacher/students/api/skills.schema';
import { studentListSchema } from '@/features/teacher/students/api/student.schema';
import { api } from '@/lib/api/client';

export interface StudentListFilters {
  page: number;
}

/**
 * The class roster — §5.6, `Paginated`, no documented filters. Also feeds
 * the assessment builder's individual-student picker. Search is applied
 * client-side over the fetched page rather than an undocumented `?search=`
 * param — a homeroom class is small enough that this stays complete for a
 * one-page roster.
 */
export const studentListQuery = (filters: StudentListFilters) =>
  queryOptions({
    queryKey: teacherKeys.studentList(filters),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.students.list, studentListSchema, {
        params: { page: filters.page },
        signal,
      }),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

/** One child, by skill — `frontend-integration.md` §5.5. Two levels, movement, weak subskills. */
export const studentSkillsQuery = (studentId: string) =>
  queryOptions({
    queryKey: teacherKeys.studentProfile(studentId),
    queryFn: ({ signal }) =>
      api.get(teacherEndpoints.students.skills(studentId), studentSkillsSchema, { signal }),
    staleTime: 60_000,
  });
