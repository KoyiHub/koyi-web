import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * The bank is read-only here on purpose (`frontend-integration.md` §7.4) — no
 * create or edit control belongs on this page, only browsing.
 */
describe('QuestionBankPage', () => {
  it('browses the seeded bank with no create or edit action', async () => {
    renderRoute(paths.teacher.questionBank);

    expect(await screen.findByRole('heading', { name: 'Question Bank' })).toBeInTheDocument();
    expect(await screen.findByText('Which letter makes this sound?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new question/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
