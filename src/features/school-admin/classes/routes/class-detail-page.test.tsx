import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { classes } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * Class delete — `frontend-integration.md` §4.3: refused with `400` while
 * any student is still enrolled, offering a transfer link rather than a
 * delete button that just fails.
 */
const occupiedClass = classes.find((entry) => entry.student_count > 0)!;

describe('ClassDetailPage', () => {
  it('refuses to delete an occupied class and offers to transfer its students', async () => {
    const { user } = renderRoute(paths.schoolAdmin.classes.detail(occupiedClass.id));

    await screen.findByRole('heading', { name: occupiedClass.display_name });
    await user.click(screen.getByRole('button', { name: 'Delete class' }));

    expect(
      await screen.findByText(/Transfer every student out of this class before deleting it\./),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Transfer these students first →' })).toHaveAttribute(
      'href',
      paths.schoolAdmin.students.transfer,
    );
  });
});
