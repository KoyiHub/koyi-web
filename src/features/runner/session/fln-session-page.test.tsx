import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

/**
 * Guards the player's spine: the question that shows, the gate on Next, and
 * that answering moves the child forward.
 *
 * Deliberately asserts nothing about correctness — the player has no answer
 * key, and adding one to a test would put it in the bundle.
 */
describe('FlnSessionPage', () => {
  it('opens on the first question with Next disabled', async () => {
    renderRoute('/assessment/session');

    expect(
      await screen.findByRole('heading', { name: 'How many sticks are there?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Question 1 out of 13')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Previous/ })).toBeDisabled();
  });

  it('enables Next once an answer is chosen and advances to the next question', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByRole('heading', { name: 'How many sticks are there?' });

    await user.click(screen.getByRole('radio', { name: '5' }));

    const next = screen.getByRole('button', { name: 'Next' });
    expect(next).toBeEnabled();

    await user.click(next);

    expect(
      await screen.findByRole('heading', { name: 'How many tens and ones are in 34?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Question 2 out of 13')).toBeInTheDocument();
  });

  it('keeps an answer when the child steps back to it', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByRole('heading', { name: 'How many sticks are there?' });

    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('heading', { name: 'How many tens and ones are in 34?' });

    await user.click(screen.getByRole('button', { name: /Previous/ }));

    expect(await screen.findByRole('radio', { name: '5' })).toBeChecked();
  });
});
