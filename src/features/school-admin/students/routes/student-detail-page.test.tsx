import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { students } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * Student detail — `frontend-integration.md` §4.5: the `/fln/` panel (two
 * independent levels, never combined — §9), disable/enable, and a two-step
 * delete behind a code.
 */
const assessedStudent = students.find((student) => student.status === 'active' && student.fln)!;
const notYetAssessedStudent = students.find(
  (student) => student.status === 'active' && !student.fln,
)!;

describe('StudentDetailPage', () => {
  it('shows independent literacy and numeracy levels, never a combined score', async () => {
    renderRoute(paths.schoolAdmin.students.detail(assessedStudent.id));

    await screen.findByRole('heading', { name: assessedStudent.full_name });
    expect(await screen.findByText(/Literacy — Working on Level/)).toBeInTheDocument();
    expect(screen.getByText(/Numeracy — Working on Level/)).toBeInTheDocument();
  });

  it('shows a not-yet-assessed state instead of a guessed-at empty panel', async () => {
    renderRoute(paths.schoolAdmin.students.detail(notYetAssessedStudent.id));

    await screen.findByRole('heading', { name: notYetAssessedStudent.full_name });
    expect(await screen.findByText(/Not yet assessed/)).toBeInTheDocument();
  });

  it('toggles a student between active and disabled', async () => {
    const { user } = renderRoute(paths.schoolAdmin.students.detail(assessedStudent.id));

    await screen.findByRole('heading', { name: assessedStudent.full_name });
    await user.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() => {
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Enable' })).toBeInTheDocument();
  });

  it('deletes the student behind a two-step confirmation code', async () => {
    const { user, router } = renderRoute(paths.schoolAdmin.students.detail(assessedStudent.id));

    await screen.findByRole('heading', { name: assessedStudent.full_name });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Send confirmation code' }));

    const boxes = await screen.findAllByRole('textbox');
    await user.type(boxes[0]!, '123456');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.schoolAdmin.students.list);
    });
  });
});
