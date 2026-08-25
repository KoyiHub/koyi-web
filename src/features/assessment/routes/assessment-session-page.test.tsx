import { describe, expect, it } from 'vitest';

import { assessmentQuestions } from '@/features/assessment/data/assessment-session-fixture';
import { renderRoute, screen } from '@/test/test-utils';

describe('AssessmentSessionPage', () => {
  it('does not render the teacher sidebar', async () => {
    renderRoute('/assessment/session');

    await screen.findByRole('heading', { name: 'Amina Yusuf' });

    expect(screen.queryByRole('navigation', { name: 'Teacher' })).not.toBeInTheDocument();
    expect(screen.queryByText('FLN Assessment Platform')).not.toBeInTheDocument();
  });

  it('renders the first question and progress indicator', async () => {
    renderRoute('/assessment/session');

    expect(await screen.findByText('Question 1 of 5')).toBeInTheDocument();
    expect(
      screen.getByText(
        "In the sentence 'We stayed inside because it rained.', what does 'because' help show?",
      ),
    ).toBeInTheDocument();
  });

  it('disables Previous on the first question', async () => {
    renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('disables Next until the current question has a response', async () => {
    renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next once an answer is selected', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('moves to question 2 when Next is clicked', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument();
    expect(
      screen.getByText(/Tunde and his friends planted beans behind their classroom/),
    ).toBeInTheDocument();
  });

  it('returns to question 1 when Previous is clicked', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 2 of 5');

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(await screen.findByText('Question 1 of 5')).toBeInTheDocument();
  });

  it('keeps the previous answer selected when returning to a question', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 2 of 5');
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await screen.findByText('Question 1 of 5');

    expect(screen.getByLabelText('meaning/relationship in the sentence')).toBeChecked();
  });

  it('updates the progress indicator as questions are answered', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Question 2 of 5')).toBeInTheDocument();

    await user.click(screen.getByLabelText('beans'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Question 3 of 5')).toBeInTheDocument();
  });

  it('shows Finish Assessment on the final question', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 2 of 5');

    await user.click(screen.getByLabelText('beans'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 3 of 5');

    await user.click(screen.getByLabelText('1000'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 4 of 5');

    await user.click(screen.getByLabelText('200'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 5 of 5');

    expect(screen.getByRole('button', { name: 'Finish Assessment' })).toBeInTheDocument();
  });

  it('navigates to the completion screen when Finish Assessment is clicked', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 2 of 5');

    await user.click(screen.getByLabelText('beans'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 3 of 5');

    await user.click(screen.getByLabelText('1000'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 4 of 5');

    await user.click(screen.getByLabelText('200'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 5 of 5');

    await user.click(screen.getByLabelText('24'));
    await user.click(screen.getByRole('button', { name: 'Finish Assessment' }));

    expect(await screen.findByRole('heading', { name: 'Assessment Complete' })).toBeInTheDocument();
  });

  it('shows the expected actions on the completion screen', async () => {
    const { user } = renderRoute('/assessment/session');
    await screen.findByText('Question 1 of 5');

    await user.click(screen.getByLabelText('meaning/relationship in the sentence'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 2 of 5');

    await user.click(screen.getByLabelText('beans'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 3 of 5');

    await user.click(screen.getByLabelText('1000'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 4 of 5');

    await user.click(screen.getByLabelText('200'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Question 5 of 5');

    await user.click(screen.getByLabelText('24'));
    await user.click(screen.getByRole('button', { name: 'Finish Assessment' }));

    await screen.findByRole('heading', { name: 'Assessment Complete' });

    expect(screen.getByText("Amina Yusuf's responses have been recorded.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to Assessment Setup' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assess Next Student' })).toBeInTheDocument();
  });

  it('never exposes a correct-answer or is_correct field on fixture questions', () => {
    for (const question of assessmentQuestions) {
      expect(question).not.toHaveProperty('correctAnswer');
      expect(question).not.toHaveProperty('correct_answer');
      expect(question).not.toHaveProperty('is_correct');
      for (const option of question.options) {
        expect(option).not.toHaveProperty('is_correct');
        expect(option).not.toHaveProperty('isCorrect');
      }
    }
  });
});
