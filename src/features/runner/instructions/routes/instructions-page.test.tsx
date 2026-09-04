import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { setSitting } from '@/lib/api/sitting-store';
import {
  invalidateSession,
  startNewSitting,
  startSection,
  submitSection,
} from '@/mocks/data/runner-seed';
import { renderRoute, screen, within } from '@/test/test-utils';

function signIn() {
  setSitting(startNewSitting());
}

describe('InstructionsPage', () => {
  it('unlocks only the first section', async () => {
    signIn();
    renderRoute(paths.assessment.instructions, { authenticated: false });

    const reading = (await screen.findByText('Reading')).closest('li');
    expect(reading).not.toBeNull();
    expect(within(reading!).getByRole('button', { name: 'Start' })).toBeInTheDocument();

    const numbers = screen.getByText('Numbers').closest('li');
    expect(numbers).not.toBeNull();
    expect(within(numbers!).queryByRole('button')).not.toBeInTheDocument();
  });

  it('unlocks the second section once the first is submitted', async () => {
    signIn();
    startSection('sec-reading');
    submitSection('sec-reading');

    renderRoute(paths.assessment.instructions, { authenticated: false });

    const numbers = (await screen.findByText('Numbers')).closest('li');
    expect(numbers).not.toBeNull();
    expect(within(numbers!).getByRole('button', { name: 'Start' })).toBeInTheDocument();

    const reading = screen.getByText('Reading').closest('li');
    expect(reading).not.toBeNull();
    expect(within(reading!).getByText('Done')).toBeInTheDocument();
  });

  it('sends a child with an expired sitting back to the entry page', async () => {
    signIn();
    invalidateSession();

    renderRoute(paths.assessment.instructions, { authenticated: false });

    expect(await screen.findByRole('heading', { name: "Let's get started" })).toBeInTheDocument();
  });
});
