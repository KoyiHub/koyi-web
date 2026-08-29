import { describe, expect, it } from 'vitest';

import { renderRoute, screen, waitFor, within } from '@/test/test-utils';

describe('QuestionBankPage', () => {
  it('renders the bank heading and the filter rail', async () => {
    renderRoute('/teacher/question-bank');

    expect(await screen.findByRole('heading', { name: 'Question bank' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Subject' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Question type' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Level' })).toBeInTheDocument();
  });

  it('renders questions from the fixture with their reference', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });

    expect(await screen.findByText('KOYI-1042')).toBeInTheDocument();
  });

  it('keeps Add to assessment disabled until a question is ticked', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });
    await screen.findByText('KOYI-1042');

    expect(screen.getByRole('button', { name: /Add to assessment/ })).toBeDisabled();

    await user.click(screen.getAllByRole('checkbox')[0]!);

    expect(screen.getByRole('button', { name: /Add 1 to assessment/ })).toBeEnabled();
  });

  it('clears the selection from the Clear control', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });
    await screen.findByText('KOYI-1042');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    await user.click(checkboxes[1]!);
    expect(screen.getByRole('button', { name: /Add 2 to assessment/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear 2 selected' }));

    expect(screen.getByRole('button', { name: /Add to assessment/ })).toBeDisabled();
  });

  it('carries the selection into the assessment builder', async () => {
    const { user, router } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });
    await screen.findByText('KOYI-1042');

    await user.click(screen.getAllByRole('checkbox')[0]!);
    await user.click(screen.getByRole('button', { name: /Add 1 to assessment/ }));

    // The builder is a lazy route, so the navigation only commits once its
    // chunk has loaded. Under a loaded suite that can take a few seconds.
    await waitFor(
      () => {
        expect(router.state.location.pathname).toBe('/teacher/assessments/create');
      },
      { timeout: 10_000 },
    );
  });

  it('narrows the list when a question-type filter is pressed', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });
    await screen.findByText('KOYI-1042');

    const typeGroup = screen.getByRole('heading', { name: 'Question type' }).parentElement!;
    // The rail is built from the server's counts, so pick whatever the second
    // row happens to be rather than pinning the test to one fixture type.
    const typeFilter = within(typeGroup).getAllByRole('button')[1]!;
    await user.click(typeFilter);

    expect(typeFilter).toHaveAttribute('aria-pressed', 'true');
  });

  // The bank is authoring input, but it is still a read screen: nothing on it
  // may tell a teacher — or anyone reading over their shoulder — which option
  // is the right one.
  it('never renders a correct-answer, is_correct or answer-key field', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });
    await screen.findByText('KOYI-1042');

    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is_correct/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/answer key/i)).not.toBeInTheDocument();
  });

  it('does not offer a Start assessment action', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question bank' });

    expect(screen.queryByRole('button', { name: /start assessment/i })).not.toBeInTheDocument();
  });
});
