import { queryOptions } from '@tanstack/react-query';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import { studentSkillsSchema } from '@/features/teacher/students/api/skills.schema';
import { studentListSchema } from '@/features/teacher/students/api/student.schema';
import { api } from '@/lib/api/client';

export interface StudentListFilters {
  search: string;
  /** `all`, or a `LearningLevel`. */
  level: string;
  page: number;
}

/** The class roster. Also feeds the assessment builder's student picker. */
export const studentListQuery = (filters: StudentListFilters) =>
  queryOptions({
    queryKey: teacherKeys.studentList(filters),
    queryFn: ({ signal }) => {
      const search = new URLSearchParams({ page: String(filters.page) });
      if (filters.search) search.set('search', filters.search);
      if (filters.level !== 'all') search.set('level', filters.level);

      return api.get(`${teacherEndpoints.students.list}?${search.toString()}`, studentListSchema, {
        signal,
      });
    },
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
