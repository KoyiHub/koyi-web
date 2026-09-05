import type { Skill, Subskill } from '@/features/teacher/bank/api/bank.schema';

/** Resolves a subskill's name and level range from the taxonomy, by id. */
export function findSubskill(
  skills: Skill[],
  subskillId: string,
): { skill: Skill; subskill: Subskill } | null {
  for (const skill of skills) {
    const subskill = skill.subskills.find((candidate) => candidate.id === subskillId);
    if (subskill) return { skill, subskill };
  }
  return null;
}
