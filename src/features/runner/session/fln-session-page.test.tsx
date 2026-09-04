import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { setSitting } from '@/lib/api/sitting-store';
import {
  forceExpiredOnNextStart,
  startNewSitting,
  startSection,
  submitSection,
} from '@/mocks/data/runner-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * Drives the player against the real `/v1/student/assessment/*` endpoints
 * (via MSW) rather than the deleted fixture — start, autosave, submit, and
 * the section-timeout guard from B.5.
 *
 * Deliberately asserts nothing about correctness: the player has no answer
 * key, and adding one to a test would put it in the bundle.
 */
function signIn() {
  setSitting(startNewSitting());
}

describe('FlnSessionPage', () => {
  it('walks through a section and returns to the hub with the next one unlocked', async () => {
    signIn();
    const { user } = renderRoute(`${paths.assessment.session}?section=sec-reading`, {
      authenticated: false,
    });

    expect(
      await screen.findByRole('heading', { name: "Which one starts with the same sound as 'B'?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Ball' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Say the word you see.');
    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    await screen.findByRole('heading', { name: 'Where did Amaka go?' });
    await user.click(screen.getByRole('radio', { name: 'School' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: 'What did the child feed?' });
    await user.click(screen.getByRole('radio', { name: 'Chickens' }));
    await user.click(screen.getByRole('button', { name: 'Finish section' }));

    expect(await screen.findByRole('heading', { name: 'Term 1 baseline' })).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('reaches the summary once the last section is submitted', async () => {
    signIn();
    startSection('sec-reading');
    submitSection('sec-reading');

    const { user } = renderRoute(`${paths.assessment.session}?section=sec-numbers`, {
      authenticated: false,
    });

    await screen.findByRole('heading', { name: 'Which number is this?' });
    await user.click(screen.getByRole('radio', { name: 'SEVEN' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: 'How many tens and ones are in 34?' });
    await user.click(screen.getByRole('radio', { name: '3 tens + 4 ones' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: 'Which group has MORE?' });
    await user.click(screen.getByRole('radio', { name: 'Group A' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByRole('heading', { name: 'What is 2 + 3?' });
    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Finish section' }));

    expect(await screen.findByRole('heading', { name: 'All done!' })).toBeInTheDocument();
  });

  it('sends a section whose clock already ran out straight to the timeout screen', async () => {
    signIn();
    forceExpiredOnNextStart();

    renderRoute(`${paths.assessment.session}?section=sec-reading`, { authenticated: false });

    expect(await screen.findByRole('heading', { name: "Time's up for now" })).toBeInTheDocument();
  });
});
