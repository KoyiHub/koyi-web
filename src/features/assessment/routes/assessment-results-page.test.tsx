import { describe, expect, it } from 'vitest';

import { renderRoute, screen, within } from '@/test/test-utils';

describe('AssessmentResultsPage', () => {
  it('renders the Assessment Results heading and assessment context', async () => {
    renderRoute('/teacher/assessment/results');

    expect(await screen.findByRole('heading', { name: 'Assessment Results' })).toBeInTheDocument();
    expect(
      screen.getByText(/Primary 4 - Class A · FLN Assessment · Completed Aug 18, 2026/),
    ).toBeInTheDocument();
    expect(screen.getByText(/32 Students Assessed/)).toBeInTheDocument();
  });

  it('renders the Strong/Intermediate/Struggling summary', async () => {
    renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    const summary = screen.getByRole('heading', { name: 'Summary' }).closest('section')!;
    expect(within(summary).getByText('10 / 31%')).toBeInTheDocument();
    expect(within(summary).getByText('14 / 44%')).toBeInTheDocument();
    expect(within(summary).getByText('8 / 25%')).toBeInTheDocument();
  });

  it('renders skill performance', async () => {
    renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    const skills = screen.getByRole('heading', { name: 'Skill Performance' }).closest('section')!;
    expect(within(skills).getByText('Reading')).toBeInTheDocument();
    expect(within(skills).getByText('68%')).toBeInTheDocument();
    expect(within(skills).getByText('Comprehension')).toBeInTheDocument();
    expect(within(skills).getByText('61%')).toBeInTheDocument();
    expect(within(skills).getByText('Mathematics')).toBeInTheDocument();
    expect(within(skills).getByText('76%')).toBeInTheDocument();
  });

  it('renders common learning gaps', async () => {
    renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    const gaps = screen.getByRole('heading', { name: 'Common Learning Gaps' }).closest('section')!;
    expect(within(gaps).getByText('Word Reading')).toBeInTheDocument();
    expect(within(gaps).getByText('12 students')).toBeInTheDocument();
    expect(within(gaps).getByText('Subtraction')).toBeInTheDocument();
    expect(within(gaps).getByText('7 students')).toBeInTheDocument();
  });

  it('renders student results with score and level', async () => {
    renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    const table = screen.getByRole('table');
    const aminaRow = within(table).getByText('Amina Yusuf').closest('tr')!;
    expect(within(aminaRow).getByText('67%')).toBeInTheDocument();
    expect(within(aminaRow).getByText('Intermediate')).toBeInTheDocument();

    const zainabRow = within(table).getByText('Zainab Idris').closest('tr')!;
    expect(within(zainabRow).getByText('39%')).toBeInTheDocument();
    expect(within(zainabRow).getByText('Struggling')).toBeInTheDocument();
  });

  it('navigates to the matching student detail route from View Student', async () => {
    renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    const table = screen.getByRole('table');
    const aminaRow = within(table).getByText('Amina Yusuf').closest('tr')!;
    const link = within(aminaRow).getByRole('link', { name: 'View Student' });
    expect(link).toHaveAttribute('href', '/teacher/students/stu-amina-yusuf');
  });

  it('navigates to Class Progress when View Class Progress is clicked', async () => {
    const { user } = renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    await user.click(screen.getByRole('button', { name: 'View Class Progress' }));

    expect(await screen.findByRole('heading', { name: 'Class Progress' })).toBeInTheDocument();
  });

  it('navigates to Assessment Setup when New Assessment is clicked', async () => {
    const { user } = renderRoute('/teacher/assessment/results');
    await screen.findByRole('heading', { name: 'Assessment Results' });

    await user.click(screen.getByRole('button', { name: 'New Assessment' }));

    expect(
      await screen.findByRole('heading', { name: 'New Assessment Session' }),
    ).toBeInTheDocument();
  });
});
