import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { teachers } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * The list is served by MSW and filtered on the server, so every assertion
 * after a keystroke has to wait for the debounced refetch rather than read the
 * DOM synchronously.
 */
const firstTeacher = teachers[0]!;

/** A teacher whose name is unique in the seed, so one query returns one row. */
const uniqueTeacher = teachers.find(
  (teacher) => teachers.filter((other) => other.full_name === teacher.full_name).length === 1,
)!;

const unmatchedTeacher = teachers.find(
  (teacher) => !teacher.full_name.toLowerCase().includes(uniqueTeacher.full_name.toLowerCase()),
)!;

describe('TeachersPage', () => {
  it('renders the Teachers heading and the first page of the list', async () => {
    renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Teachers' })).toBeInTheDocument();
    expect(await screen.findByText(firstTeacher.teacher_id)).toBeInTheDocument();
  });

  it('filters the list by teacher name', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    const search = await screen.findByRole('searchbox', { name: 'Search teachers' });
    await user.type(search, uniqueTeacher.full_name);

    expect(await screen.findByText(uniqueTeacher.teacher_id)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(unmatchedTeacher.teacher_id)).not.toBeInTheDocument();
    });
  });

  it('filters the list by teacher ID', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    const search = await screen.findByRole('searchbox', { name: 'Search teachers' });
    await user.type(search, uniqueTeacher.teacher_id);

    expect(await screen.findByText(uniqueTeacher.teacher_id)).toBeInTheDocument();
  });

  it('shows an empty state for a query with no matches', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    const search = await screen.findByRole('searchbox', { name: 'Search teachers' });
    await user.type(search, 'no-such-teacher');

    expect(await screen.findByText('No teachers match "no-such-teacher".')).toBeInTheDocument();
  });

  it('never resolves into a Teacher-app route', async () => {
    const { router } = renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    await screen.findByRole('heading', { name: 'Teachers' });

    expect(router.state.location.pathname).toBe(paths.schoolAdmin.teachers.list);
    expect(router.state.location.pathname.startsWith('/school-admin')).toBe(true);
  });

  it('does not offer an age column, which the brief removed', async () => {
    renderRoute(paths.schoolAdmin.teachers.list, { authenticated: false });

    await screen.findByText(firstTeacher.teacher_id);
    expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument();
  });
});
