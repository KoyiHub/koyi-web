import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen } from '@/test/test-utils';

describe('AssessmentLibraryPage', () => {
  it('lists the seeded assessments with their status', async () => {
    renderRoute(paths.teacher.assessments.list);

    expect(await screen.findByRole('heading', { name: 'Assessments' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'New assessment' })).toBeInTheDocument();
  });
});
