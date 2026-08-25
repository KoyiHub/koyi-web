/**
 * PROVISIONAL UI fixture data. Class list, student roster, and assessment type
 * copy are illustrative only — no assessment-setup backend contract is confirmed
 * yet. Replace with TanStack Query hooks behind the same shapes once endpoints
 * exist; no component here should need rewriting.
 */

export interface ClassOption {
  id: string;
  label: string;
}

export interface StudentOption {
  id: string;
  name: string;
}

export type AssessmentTypeId = 'fln' | 'custom-quiz';

export interface AssessmentTypeOption {
  id: AssessmentTypeId;
  label: string;
  description: string;
  skills: string[];
  disabled: boolean;
}

export const classOptions: ClassOption[] = [
  { id: 'p4-a', label: 'Primary 4 - Class A' },
  { id: 'p4-b', label: 'Primary 4 - Class B' },
  { id: 'p5-a', label: 'Primary 5 - Class A' },
];

export const defaultClassId = 'p4-a';

export const studentRoster: StudentOption[] = [
  { id: 'stu-amina-yusuf', name: 'Amina Yusuf' },
  { id: 'stu-ibrahim-musa', name: 'Ibrahim Musa' },
  { id: 'stu-fatima-bello', name: 'Fatima Bello' },
  { id: 'stu-daniel-okafor', name: 'Daniel Okafor' },
];

export const assessmentTypeOptions: AssessmentTypeOption[] = [
  {
    id: 'fln',
    label: 'FLN Assessment',
    description: "Assess students' foundational literacy and numeracy skills.",
    skills: ['Reading', 'Comprehension', 'Mathematics'],
    disabled: false,
  },
  {
    id: 'custom-quiz',
    label: 'Custom Quiz',
    description: 'Build a custom set of questions for this session.',
    skills: [],
    disabled: true,
  },
];

export const defaultAssessmentTypeId: AssessmentTypeId = 'fln';
