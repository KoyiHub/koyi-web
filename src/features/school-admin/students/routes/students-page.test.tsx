import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { students } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

const firstStudent = students[0]!;

/** A student whose name is unique in the seed, so one query returns one row. */
const uniqueStudent = students.find(
  (student) => students.filter((other) => other.full_name === student.full_name).length === 1,
)!;

const unmatchedStudent = students.find(
  (student) => !student.full_name.toLowerCase().includes(uniqueStudent.full_name.toLowerCase()),
)!;

describe('School Admin StudentsPage', () => {
  it('renders the Students heading and the first page of the list', async () => {
    renderRoute(paths.schoolAdmin.students.list, { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Students' })).toBeInTheDocument();
    expect(await screen.findByText(firstStudent.student_id)).toBeInTheDocument();
  });

  it('filters the list by student name', async () => {
    const { user } = renderRoute(paths.schoolAdmin.students.list, { authenticated: false });

    const search = await screen.findByRole('searchbox', { name: 'Search students' });
    await user.type(search, uniqueStudent.full_name);

    expect(await screen.findByText(uniqueStudent.student_id)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(unmatchedStudent.student_id)).not.toBeInTheDocument();
    });
  });

  it('filters the list by student ID', async () => {
    const { user } = renderRoute(paths.schoolAdmin.students.list, { authenticated: false });

    const search = await screen.findByRole('searchbox', { name: 'Search students' });
    await user.type(search, uniqueStudent.student_id);

    expect(await screen.findByText(uniqueStudent.student_id)).toBeInTheDocument();
  });

  it('lists no email column, which the brief removed', async () => {
    renderRoute(paths.schoolAdmin.students.list, { authenticated: false });

    await screen.findByText(firstStudent.student_id);
    expect(screen.queryByRole('columnheader', { name: /email/i })).not.toBeInTheDocument();
  });

  it('never renders Student login fields on the Add Student form', async () => {
    renderRoute(paths.schoolAdmin.students.new, { authenticated: false });

    await screen.findByRole('heading', { name: 'Add New Student' });

    // Students have no login credentials of their own — no student email or
    // password field. The guardian's optional email (where an assessment
    // link is sent) is a different field and is expected to be present.
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/guardian email/i)).toBeInTheDocument();
  });
});
