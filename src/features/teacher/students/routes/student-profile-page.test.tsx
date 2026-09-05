import { describe, expect, it } from 'vitest';

import { createAssessment, createSection, publish } from '@/mocks/data/assessment-seed';
import { assignStudents } from '@/mocks/data/assignment-seed';
import { computeStudentSkills } from '@/mocks/data/results-seed';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * One child, by skill — `frontend-integration.md` §5.5. No overall score, no
 * single band; literacy and numeracy render side by side and independently
 * (§9), and the security boundary this page must respect is that nothing
 * about the answer key ever surfaces here.
 */
function publishedAssessment() {
  const assessment = createAssessment({
    name: 'Term check',
    instructions: '',
    opens_at: null,
    closes_at: null,
  });
  const section = createSection(assessment, {
    domain: 'literacy',
    name: 'Reading',
    instructions: '',
    timer: null,
    covers: [],
  });
  section.questions.push({
    subskill_id: 'sub-letter-sounds',
    fln_level: 1,
    question_type: 'single_choice',
    layout: 'media_grid_choice',
    text: 'Which letter makes this sound?',
    description: '',
    point: '1.00',
    source_question_id: null,
    contents: [],
    options: [{ type: 'text', value: 'B', is_correct: true }],
    answer: null,
  });
  const result = publish(assessment);
  if (!result.ok) throw new Error(result.message);
  return assessment;
}

/**
 * The mock simulates a fraction of assigned children as not-yet-submitted
 * (`results-seed.ts`), so a single assign-and-check isn't guaranteed to
 * produce a result — this seeds fresh assessments until one does, which
 * settles within one or two tries given the simulated submission rate.
 */
function seedAssessedStudent(studentId: string): void {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const assessment = publishedAssessment();
    assignStudents(assessment.id, { student_ids: [studentId] });
    if (computeStudentSkills(studentId)) return;
  }
  throw new Error(`Could not seed a submitted result for ${studentId}.`);
}

describe('StudentProfilePage', () => {
  it('shows the not-yet-assessed state for a child with no simulated results', async () => {
    renderRoute('/teacher/students/stu-grace-mba');

    expect(await screen.findByText('Not yet assessed')).toBeInTheDocument();
  });

  it("renders both domains' levels independently, never combined", async () => {
    seedAssessedStudent('stu-amina-yusuf');
    renderRoute('/teacher/students/stu-amina-yusuf');

    expect(await screen.findByRole('heading', { name: 'Amina Yusuf' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Literacy skills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Numeracy skills' })).toBeInTheDocument();
    expect(screen.getAllByText(/^Working on Level \d$/)).toHaveLength(2);
  });

  it('renders movement since the last assessment when there is a second data point', async () => {
    seedAssessedStudent('stu-chinedu-okafor');
    seedAssessedStudent('stu-chinedu-okafor');
    renderRoute('/teacher/students/stu-chinedu-okafor');

    await screen.findByRole('heading', { name: 'Chinedu Okafor' });
    expect(screen.getByRole('heading', { name: 'Since the last assessment' })).toBeInTheDocument();
  });

  // The teacher surface legitimately carries `is_correct` elsewhere (the
  // review view), but this page is a level summary, not a review screen —
  // it should never mention correctness at all.
  it('never mentions correctness — this is a level summary, not a review screen', async () => {
    seedAssessedStudent('stu-fatima-bello');
    renderRoute('/teacher/students/stu-fatima-bello');
    await screen.findByRole('heading', { name: 'Fatima Bello' });

    expect(screen.queryByText(/is_correct/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/answer key/i)).not.toBeInTheDocument();
  });
});
