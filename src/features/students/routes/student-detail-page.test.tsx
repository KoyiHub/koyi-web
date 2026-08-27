import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('StudentDetailPage', () => {
  it("renders Amina Yusuf's identity block", async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');

    const nameHeading = await screen.findByRole('heading', { name: 'Amina Yusuf' });
    const identity = nameHeading.closest('header')!;

    expect(within(identity).getByText('Primary 4')).toBeInTheDocument();
    expect(within(identity).getByText('Student ID')).toBeInTheDocument();
    expect(within(identity).getByText('2026-04A-12')).toBeInTheDocument();
    expect(within(identity).getByText('Intermediate')).toBeInTheDocument();
    expect(within(identity).getByText('9 yrs')).toBeInTheDocument();
  });

  it('renders latest assessment values and assessment history', async () => {
    renderRoute('/teacher/students/stu-amina-yusuf');
    const nameHeading = await screen.findByRole('heading', { name: 'Amina Yusuf' });
    const page = nameHeading.closest('header')!.parentElement!;

    const latestAssessment = within(page)
      .getByRole('heading', { name: 'Latest Assessment' })
      .closest('section')!;
    expect(within(latestAssessment).getByText('62%')).toBeInTheDocument();
    expect(within(latestAssessment).getByText('60%')).toBeInTheDocument();
    expect(within(latestAssessment).getByText('80%')).toBeInTheDocument();

    const history = within(page)
      .getByRole('heading', { name: 'Assessment History' })
      .closest('section')!;
    expect(within(history).getByText('Aug 18, 2026')).toBeInTheDocument();
    expect(within(history).getByText('May 12, 2026')).toBeInTheDocument();
    expect(within(history).getByText('Feb 05, 2026')).toBeInTheDocument();
    expect(within(history).getByText('Beginner')).toBeInTheDocument();
    expect(within(history).getByText(/Avg:\s*67%/)).toBeInTheDocument();
    expect(within(history).getByText(/Avg:\s*45%/)).toBeInTheDocument();
    expect(within(history).getByText(/Avg:\s*30%/)).toBeInTheDocument();
  });

  it('navigates to assessment setup when Start New Assessment is clicked', async () => {
    const { user } = renderRoute('/teacher/students/stu-amina-yusuf');
    await screen.findByRole('heading', { name: 'Amina Yusuf' });

    await user.click(screen.getByRole('button', { name: 'Start New Assessment' }));

    expect(
      await screen.findByRole('heading', { name: 'New Assessment Session' }),
    ).toBeInTheDocument();
  });

  it('shows a safe not-found state for an unknown student ID', async () => {
    renderRoute('/teacher/students/does-not-exist');

    expect(await screen.findByRole('heading', { name: 'Student not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Students/ })).toBeInTheDocument();
  });
});
