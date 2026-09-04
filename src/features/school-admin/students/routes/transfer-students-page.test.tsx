import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { classes, students } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * Student transfer — `frontend-integration.md` §4.5. Two independent modes:
 * a hand-picked set of students, or every student in one class at once.
 */
const sourceClass = classes.find((entry) => entry.student_count > 0)!;
const destinationClass = classes.find((entry) => entry.id !== sourceClass.id)!;
const student = students.find(
  (entry) => entry.class_id === sourceClass.id && entry.status === 'active',
)!;

describe('TransferStudentsPage', () => {
  it('transfers a hand-picked selection of students to another class', async () => {
    const { user } = renderRoute(paths.schoolAdmin.students.transfer);

    await screen.findByRole('heading', { name: 'Transfer Students' });

    const search = await screen.findByRole('searchbox', { name: 'Search students' });
    await user.type(search, student.full_name);

    const checkbox = await screen.findByRole('checkbox', { name: new RegExp(student.full_name) });
    await user.click(checkbox);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Transfer to' }),
      destinationClass.id,
    );

    await user.click(screen.getByRole('button', { name: 'Transfer selected' }));

    expect(await screen.findByText(/Transferred 1 student\(s\)\./)).toBeInTheDocument();
  });

  it('moves every student out of one class into another', async () => {
    const { user } = renderRoute(paths.schoolAdmin.students.transfer);

    await screen.findByRole('heading', { name: 'Transfer Students' });
    await user.click(screen.getByRole('radio', { name: 'Whole class' }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'From class' }), sourceClass.id);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'To class' })).not.toHaveValue(sourceClass.id);
    });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'To class' }),
      destinationClass.id,
    );

    await user.click(screen.getByRole('button', { name: 'Transfer whole class' }));

    expect(await screen.findByText(/Transferred \d+ student\(s\)\./)).toBeInTheDocument();
  });
});
