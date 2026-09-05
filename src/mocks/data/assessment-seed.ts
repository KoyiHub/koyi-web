/**
 * The live in-memory store behind `/v1/teacher/assessments/*` —
 * `frontend-integration.md` §5.3. Draft-then-publish, sections as sittings,
 * questions replaced wholesale, coverage computed from what is actually saved.
 *
 * SECURITY BOUNDARY: this file legitimately holds `is_correct` — it is the
 * teacher-authored source of truth, same as the real bank. Nothing under
 * `/v1/student/*` (Phase 2) reads from here directly.
 */
import type {
  Assessment,
  AuthoredQuestion,
  Coverage,
  CoverageCell,
  Section,
} from '@/features/teacher/assessments/api/assessment.schema';
import { findSubskillSeed } from '@/mocks/data/taxonomy-seed';
import { TEACHER_NAME } from '@/mocks/data/teacher-seed';

export interface StoredSection extends Section {
  covers: string[];
  questions: AuthoredQuestion[];
}

export interface StoredAssessment extends Omit<Assessment, 'sections'> {
  sections: StoredSection[];
}

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter)}`;
}

/**
 * Six characters, avoiding O/0, I/1, S/5, Z/2 — a child reads this off a
 * printed sheet, and a misread character costs them a sitting. Shared with
 * `assignment-seed.ts`, since assignment codes follow the same rule.
 */
export function mintCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRTUVWXY346789';
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
}

export const assessmentStore: StoredAssessment[] = [];

export function questionCount(assessment: StoredAssessment): number {
  return assessment.sections.reduce((total, section) => total + section.questions.length, 0);
}

export function toAssessment(stored: StoredAssessment): Assessment {
  return {
    id: stored.id,
    name: stored.name,
    instructions: stored.instructions,
    status: stored.status,
    code: stored.code,
    opens_at: stored.opens_at,
    closes_at: stored.closes_at,
    published_at: stored.published_at,
    teacher_name: stored.teacher_name,
    created_at: stored.created_at,
    sections: stored.sections.map((section) => ({
      id: section.id,
      name: section.name,
      domain: section.domain,
      instructions: section.instructions,
      order: section.order,
      timer: section.timer,
      question_count: section.questions.length,
      covers: section.covers,
    })),
  };
}

export function findStored(assessmentId: string): StoredAssessment | undefined {
  return assessmentStore.find((assessment) => assessment.id === assessmentId);
}

export function findStoredSection(
  assessment: StoredAssessment,
  sectionId: string,
): StoredSection | undefined {
  return assessment.sections.find((section) => section.id === sectionId);
}

export function createAssessment(input: {
  name: string;
  instructions: string;
  opens_at: string | null;
  closes_at: string | null;
}): StoredAssessment {
  const created: StoredAssessment = {
    id: id('asm'),
    name: input.name,
    instructions: input.instructions,
    status: 'draft',
    code: '',
    opens_at: input.opens_at,
    closes_at: input.closes_at,
    published_at: null,
    teacher_name: TEACHER_NAME,
    created_at: new Date().toISOString(),
    sections: [],
  };
  assessmentStore.unshift(created);
  return created;
}

export function createSection(
  assessment: StoredAssessment,
  input: {
    domain: string;
    name: string;
    instructions: string;
    timer: string | null;
    covers: string[];
  },
): StoredSection {
  const section: StoredSection = {
    id: id('sec'),
    name: input.name,
    domain: input.domain as Section['domain'],
    instructions: input.instructions,
    order: assessment.sections.length + 1,
    timer: input.timer,
    question_count: 0,
    covers: input.covers,
    questions: [],
  };
  assessment.sections.push(section);
  return section;
}

/** Computes the skill × level grid straight from what is actually saved. */
export function computeCoverage(assessment: StoredAssessment): Coverage {
  const cellMap = new Map<string, CoverageCell>();
  const levelsProbed = new Set<number>();
  const domains = new Set<string>();

  const sections = assessment.sections.map((section) => {
    domains.add(section.domain);
    const gaps: string[] = [];
    const sectionCells: CoverageCell[] = [];

    for (const coveredId of section.covers) {
      const resolved = findSubskillSeed(coveredId);
      if (!resolved) continue;
      const hasQuestion = section.questions.some((question) => question.subskill_id === coveredId);
      if (!hasQuestion) gaps.push(resolved.subskill.name);
    }

    for (const question of section.questions) {
      const resolved = findSubskillSeed(question.subskill_id);
      if (!resolved) continue;
      levelsProbed.add(question.fln_level);

      const key = `${question.subskill_id}-${String(question.fln_level)}`;
      const cell = cellMap.get(key) ?? {
        subskill_id: question.subskill_id,
        subskill_name: resolved.subskill.name,
        skill_id: resolved.skill.id,
        skill_name: resolved.skill.name,
        domain: resolved.skill.domain,
        fln_level: question.fln_level,
        item_count: 0,
      };
      cell.item_count += 1;
      cellMap.set(key, cell);

      if (
        !sectionCells.some(
          (existing) =>
            existing.subskill_id === question.subskill_id &&
            existing.fln_level === question.fln_level,
        )
      ) {
        sectionCells.push(cellMap.get(key)!);
      }
    }

    return {
      section_id: section.id,
      section_name: section.name,
      domain: section.domain,
      question_count: section.questions.length,
      cells: sectionCells,
      gaps,
    };
  });

  const warnings: string[] = [];
  if (assessment.sections.length === 0) {
    warnings.push('This paper has no sections yet.');
  } else if (levelsProbed.size === 0) {
    warnings.push('No questions have been added yet, so this paper cannot place anyone.');
  } else if (levelsProbed.size === 1) {
    warnings.push(
      'Every question is at one level. A paper that probes one level can confirm it but cannot find where a child actually sits.',
    );
  }
  for (const section of sections) {
    if (section.gaps.length > 0) {
      warnings.push(
        `"${section.section_name}" claims to cover ${section.gaps.join(', ')} but carries no items for it.`,
      );
    }
  }

  return {
    assessment_id: assessment.id,
    question_count: questionCount(assessment),
    domains: Array.from(domains) as Coverage['domains'],
    levels_probed: Array.from(levelsProbed).sort((a, b) => a - b) as Coverage['levels_probed'],
    sections,
    warnings,
  };
}

export function publish(
  assessment: StoredAssessment,
): { ok: true } | { ok: false; message: string } {
  if (assessment.status !== 'draft')
    return { ok: false, message: 'This assessment is already published.' };
  if (assessment.sections.length === 0) {
    return { ok: false, message: 'Add at least one section before publishing.' };
  }
  const emptySection = assessment.sections.find((section) => section.questions.length === 0);
  if (emptySection) {
    return { ok: false, message: `"${emptySection.name}" has no questions yet.` };
  }

  assessment.status = 'published';
  assessment.code = mintCode();
  assessment.published_at = new Date().toISOString();
  return { ok: true };
}
