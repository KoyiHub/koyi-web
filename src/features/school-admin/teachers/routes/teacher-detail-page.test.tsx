import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { teachers } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * Teacher detail — `frontend-integration.md` §4.4: disable/enable, an
 * emailed password reset (no credential ever reaches this screen) and a
 * two-step delete behind a code.
 *
 * Each test uses its own teacher: the seed is shared, mutable, in-memory
 * state, so a delete in one test must not remove the teacher another test
 * still needs.
 */
const activeTeachers = teachers.filter((teacher) => teacher.is_active);
const [toggleTeacher, resetTeacher, deleteTeacher, wrongCodeTeacher] = activeTeachers;

describe('TeacherDetailPage', () => {
  it('toggles a teacher between active and disabled', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.detail(toggleTeacher!.id));

    await screen.findByRole('heading', { name: toggleTeacher!.full_name });
    expect(screen.getByText('Active')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() => {
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Enable' })).toBeInTheDocument();
  });

  it('sends a password reset link without ever showing a credential', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.detail(resetTeacher!.id));

    await screen.findByRole('heading', { name: resetTeacher!.full_name });
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText(/Reset link emailed to/)).toBeInTheDocument();
    expect(screen.queryByText(/temporary password/i)).not.toBeInTheDocument();
  });

  it('deletes the account behind a two-step confirmation code', async () => {
    const { user, router } = renderRoute(paths.schoolAdmin.teachers.detail(deleteTeacher!.id));

    await screen.findByRole('heading', { name: deleteTeacher!.full_name });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Send confirmation code' }));

    const boxes = await screen.findAllByRole('textbox');
    await user.type(boxes[0]!, '123456');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.schoolAdmin.teachers.list);
    });
  });

  it('rejects a wrong delete confirmation code', async () => {
    const { user } = renderRoute(paths.schoolAdmin.teachers.detail(wrongCodeTeacher!.id));

    await screen.findByRole('heading', { name: wrongCodeTeacher!.full_name });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Send confirmation code' }));

    const boxes = await screen.findAllByRole('textbox');
    await user.type(boxes[0]!, '000000');

    expect(await screen.findByText('That code is incorrect or has expired.')).toBeInTheDocument();
  });
});
