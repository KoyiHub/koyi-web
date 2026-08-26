import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('AssessmentPage', () => {
  it('renders the assessment setup heading', async () => {
    renderRoute('/assessment');

    expect(
      await screen.findByRole('heading', { name: 'New Assessment Session' }),
    ).toBeInTheDocument();
  });

  it('renders the fixture student roster', async () => {
    renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    expect(screen.getByLabelText('Amina Yusuf')).toBeInTheDocument();
    expect(screen.getByLabelText('Ibrahim Musa')).toBeInTheDocument();
    expect(screen.getByLabelText('Fatima Bello')).toBeInTheDocument();
    expect(screen.getByLabelText('Daniel Okafor')).toBeInTheDocument();
  });

  it('shows a selected count reflecting the default full selection (PDF p36: all 4 selected)', async () => {
    renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    expect(screen.getByText('4 selected')).toBeInTheDocument();
    expect(screen.getByLabelText('Select all')).toBeChecked();
  });

  it('updates the selected count immediately as individual students are deselected', async () => {
    const { user } = renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    await user.click(screen.getByLabelText('Amina Yusuf'));
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(screen.getByLabelText('Select all')).not.toBeChecked();

    await user.click(screen.getByLabelText('Ibrahim Musa'));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('reaches 0 selected when every student is deselected one at a time', async () => {
    const { user } = renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    await user.click(screen.getByLabelText('Amina Yusuf'));
    await user.click(screen.getByLabelText('Ibrahim Musa'));
    await user.click(screen.getByLabelText('Fatima Bello'));
    await user.click(screen.getByLabelText('Daniel Okafor'));

    expect(screen.getByText('0 selected')).toBeInTheDocument();
    expect(screen.getByLabelText('Select all')).not.toBeChecked();
  });

  it('toggles the entire visible roster with Select all', async () => {
    const { user } = renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    const selectAll = screen.getByLabelText('Select all');

    await user.click(selectAll);
    expect(screen.getByText('0 selected')).toBeInTheDocument();
    expect(selectAll).not.toBeChecked();

    await user.click(selectAll);
    expect(screen.getByText('4 selected')).toBeInTheDocument();
    expect(selectAll).toBeChecked();
  });

  it('disables Start Assessment once zero students are selected', async () => {
    const { user } = renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    expect(screen.getByRole('button', { name: 'Start Assessment' })).toBeEnabled();

    await user.click(screen.getByLabelText('Select all'));

    expect(screen.getByRole('button', { name: 'Start Assessment' })).toBeDisabled();
  });

  it('shows Custom Quiz as disabled with a coming soon indicator', async () => {
    renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Custom Quiz/ })).toBeDisabled();
  });

  it('navigates to the assessment session when Start Assessment is clicked', async () => {
    const { user } = renderRoute('/assessment');
    await screen.findByRole('heading', { name: 'New Assessment Session' });

    await user.click(screen.getByRole('button', { name: 'Start Assessment' }));

    expect(await screen.findByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
  });
});
