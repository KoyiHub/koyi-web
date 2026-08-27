import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('QuestionBankPage', () => {
  it('renders the Question Bank heading', async () => {
    renderRoute('/teacher/question-bank');

    expect(await screen.findByRole('heading', { name: 'Question Bank' })).toBeInTheDocument();
  });

  it('renders Subject, Category and Difficulty filters', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
  });

  it('renders questions from the fixture', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    expect(screen.getByText('KOYI-0117')).toBeInTheDocument();
    expect(
      screen.getByText(/In the sentence 'We stayed inside because it rained\./),
    ).toBeInTheDocument();
  });

  it('clicking + Add on a question updates the Selected Assessment count', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    const panel = screen.getByRole('complementary', { name: 'Selected Assessment' });
    expect(within(panel).getByText('0 selected')).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: '+ Add' });
    await user.click(addButtons[0]!);

    expect(within(panel).getByText('1 selected')).toBeInTheDocument();
  });

  it('removing a selected question works', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    const panel = screen.getByRole('complementary', { name: 'Selected Assessment' });
    await user.click(screen.getAllByRole('button', { name: '+ Add' })[0]!);
    expect(within(panel).getByText('1 selected')).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /Remove/ }));

    expect(within(panel).getByText('0 selected')).toBeInTheDocument();
  });

  it('Clear All empties the selection', async () => {
    const { user } = renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    const panel = screen.getByRole('complementary', { name: 'Selected Assessment' });
    const addButtons = screen.getAllByRole('button', { name: '+ Add' });
    await user.click(addButtons[0]!);
    await user.click(addButtons[1]!);
    expect(within(panel).getByText('2 selected')).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: 'Clear All' }));

    expect(within(panel).getByText('0 selected')).toBeInTheDocument();
  });

  it('shows a Needs review marker on a known needs-review fixture record', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    expect(screen.getByText('KOYI-0450')).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
  });

  it('never renders a correct-answer, is_correct, or answer-key field', async () => {
    renderRoute('/teacher/question-bank');
    await screen.findByRole('heading', { name: 'Question Bank' });

    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is_correct/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/answer key/i)).not.toBeInTheDocument();
  });
});
