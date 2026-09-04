import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { MOCK_ASSESSMENT_CODE, MOCK_ASSIGNMENT_CODE } from '@/mocks/data/runner-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * The whole authentication a child has — `frontend-integration.md` §6, §7.5.
 * Asserts the sameness rule (one error for every failure), the rate-limit
 * copy being distinct from it, and the guardian-link auto-submit.
 */
describe('EntryPage', () => {
  it('signs in with the correct codes and reaches the instructions hub', async () => {
    const { user } = renderRoute(paths.assessment.entry, { authenticated: false });
    await screen.findByRole('heading', { name: "Let's get started" });

    await user.type(screen.getByLabelText('Assessment code'), MOCK_ASSESSMENT_CODE);
    await user.type(screen.getByLabelText('Your code'), MOCK_ASSIGNMENT_CODE);
    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(await screen.findByRole('heading', { name: 'Term 1 baseline' })).toBeInTheDocument();
  });

  it('shows one generic message for a wrong code, never a hint', async () => {
    const { user } = renderRoute(paths.assessment.entry, { authenticated: false });
    await screen.findByRole('heading', { name: "Let's get started" });

    await user.type(screen.getByLabelText('Assessment code'), 'WRONGX');
    await user.type(screen.getByLabelText('Your code'), 'WRONGX');
    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(
      await screen.findByText(
        "That doesn't look right. Check both codes with your teacher and try again.",
      ),
    ).toBeInTheDocument();
  });

  it('auto-fills and auto-submits from a guardian link', async () => {
    renderRoute(`${paths.assessment.entry}?a=${MOCK_ASSESSMENT_CODE}&c=${MOCK_ASSIGNMENT_CODE}`, {
      authenticated: false,
    });

    expect(await screen.findByRole('heading', { name: 'Term 1 baseline' })).toBeInTheDocument();
  });

  it('answers repeated wrong attempts with the rate-limit message', async () => {
    const { user } = renderRoute(paths.assessment.entry, { authenticated: false });
    await screen.findByRole('heading', { name: "Let's get started" });

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await user.clear(screen.getByLabelText('Assessment code'));
      await user.clear(screen.getByLabelText('Your code'));
      await user.type(screen.getByLabelText('Assessment code'), 'WRONGX');
      await user.type(screen.getByLabelText('Your code'), 'WRONGX');
      await user.click(screen.getByRole('button', { name: 'Start' }));
      await screen.findByRole('alert');
    }

    expect(
      await screen.findByText('Too many attempts. Please wait a minute and try again.'),
    ).toBeInTheDocument();
  });
});
