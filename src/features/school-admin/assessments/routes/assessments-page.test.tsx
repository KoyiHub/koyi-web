import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { assessments } from '@/mocks/data/school-admin-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * School-wide assessment oversight — `frontend-integration.md` §4.8. School
 * management doesn't author papers, but sees every one of them across every
 * teacher.
 */
describe('SchoolAssessmentsPage', () => {
  it('lists assessments across every teacher, paginated', async () => {
    renderRoute(paths.schoolAdmin.assessments);

    await screen.findByRole('heading', { name: 'Assessments' });

    expect(
      await screen.findByText(new RegExp(`of ${String(assessments.length)}`)),
    ).toBeInTheDocument();
  });
});
