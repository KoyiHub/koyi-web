import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('StudentProfilePage', () => {
  it('renders the identity block for the requested child', async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');

    expect(await screen.findByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
  });

  it('breaks the profile down by subject', async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');
    await screen.findByRole('heading', { name: 'Amina Yusuf' });

    expect(screen.getByRole('heading', { name: 'Literacy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Numeracy' })).toBeInTheDocument();
  });

  it('shows the interpretation, the next steps and the question log', async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');
    await screen.findByRole('heading', { name: 'Amina Yusuf' });

    expect(screen.getByRole('heading', { name: 'AI interpretation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recommended next steps' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assessment history' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Question log' })).toBeInTheDocument();
  });

  it('filters the question log by outcome', async () => {
    const { user } = renderRoute('/teacher/students/stu-amina-yusuf');
    await screen.findByRole('heading', { name: 'Question log' });

    const filter = screen.getByRole('radiogroup', { name: 'Filter the question log by outcome' });
    expect(filter).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Incorrect' }));

    expect(screen.getByRole('radio', { name: 'Incorrect' })).toBeChecked();
  });

  // A question log that shows what the child answered must never also show
  // what the right answer was — the scoring stays on the server.
  it('never renders the correct answer alongside a logged question', async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');
    await screen.findByRole('heading', { name: 'Question log' });

    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/expected answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/answer key/i)).not.toBeInTheDocument();
  });
});
