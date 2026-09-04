/**
 * The taxonomy MSW answers `/v1/teacher/bank/skills/` with.
 *
 * `frontend-integration.md` §5.2 says 14 skills, 55 subskills in production.
 * This mock is a representative slice, not an exhaustive copy — a teacher
 * cannot tell the difference from inside the app, since every level picker and
 * coverage grid is *driven* by whatever this returns, never by a hardcoded
 * list.
 */
import type { Skill } from '@/features/teacher/bank/api/bank.schema';

export const skills: Skill[] = [
  {
    id: 'skl-phonological-awareness',
    code: 'phonological_awareness',
    name: 'Phonological Awareness',
    domain: 'literacy',
    min_level: 1,
    max_level: 2,
    is_core: true,
    subskills: [
      {
        id: 'sub-rhyming-onset',
        code: 'lit_rhyming_and_onset_sounds',
        name: 'Rhyming and onset sounds',
        min_level: null,
        max_level: null,
        level_range: [1, 2],
      },
      {
        id: 'sub-blending',
        code: 'lit_blending',
        name: 'Blending',
        min_level: 2,
        max_level: 2,
        level_range: [2, 2],
      },
    ],
  },
  {
    id: 'skl-phonics',
    code: 'alphabetic_knowledge_phonics',
    name: 'Alphabetic Knowledge & Phonics',
    domain: 'literacy',
    min_level: 1,
    max_level: 3,
    is_core: true,
    subskills: [
      {
        id: 'sub-letter-sounds',
        code: 'lit_letter_sounds',
        name: 'Letter sounds',
        min_level: null,
        max_level: null,
        level_range: [1, 3],
      },
      {
        id: 'sub-consonant-blends',
        code: 'lit_consonant_blends',
        name: 'Consonant blends and digraphs',
        min_level: 3,
        max_level: 3,
        level_range: [3, 3],
      },
    ],
  },
  {
    id: 'skl-word-reading',
    code: 'word_reading',
    name: 'Word Reading',
    domain: 'literacy',
    min_level: 2,
    max_level: 3,
    is_core: true,
    subskills: [
      {
        id: 'sub-familiar-words',
        code: 'lit_familiar_word_reading',
        name: 'Familiar word reading',
        min_level: null,
        max_level: null,
        level_range: [2, 3],
      },
      {
        id: 'sub-nonword-decoding',
        code: 'lit_nonword_decoding',
        name: 'Non-word decoding',
        min_level: 3,
        max_level: 3,
        level_range: [3, 3],
      },
    ],
  },
  {
    id: 'skl-reading-comprehension',
    code: 'reading_comprehension',
    name: 'Reading Comprehension',
    domain: 'literacy',
    min_level: 3,
    max_level: 5,
    is_core: true,
    subskills: [
      {
        id: 'sub-literal-comprehension',
        code: 'lit_literal_comprehension',
        name: 'Literal comprehension',
        min_level: null,
        max_level: null,
        level_range: [3, 5],
      },
      {
        id: 'sub-inference',
        code: 'lit_simple_inference',
        name: 'Simple inference',
        min_level: 4,
        max_level: 5,
        level_range: [4, 5],
      },
    ],
  },
  {
    id: 'skl-number-sense',
    code: 'number_sense',
    name: 'Number Sense',
    domain: 'numeracy',
    min_level: 1,
    max_level: 2,
    is_core: true,
    subskills: [
      {
        id: 'sub-number-identification',
        code: 'num_number_identification',
        name: 'Number identification',
        min_level: null,
        max_level: null,
        level_range: [1, 2],
      },
      {
        id: 'sub-quantity-comparison',
        code: 'num_quantity_comparison',
        name: 'Quantity comparison',
        min_level: 1,
        max_level: 2,
        level_range: [1, 2],
      },
    ],
  },
  {
    id: 'skl-patterns-place-value',
    code: 'patterns_place_value',
    name: 'Patterns & Place Value',
    domain: 'numeracy',
    min_level: 2,
    max_level: 3,
    is_core: true,
    subskills: [
      {
        id: 'sub-missing-numbers',
        code: 'num_missing_numbers_patterns',
        name: 'Missing numbers and patterns',
        min_level: null,
        max_level: null,
        level_range: [2, 3],
      },
      {
        id: 'sub-place-value',
        code: 'num_place_value',
        name: 'Place value',
        min_level: 3,
        max_level: 3,
        level_range: [3, 3],
      },
    ],
  },
  {
    id: 'skl-operations',
    code: 'basic_operations',
    name: 'Basic Operations',
    domain: 'numeracy',
    min_level: 2,
    max_level: 4,
    is_core: true,
    subskills: [
      {
        id: 'sub-addition',
        code: 'num_addition',
        name: 'Addition',
        min_level: null,
        max_level: null,
        level_range: [2, 4],
      },
      {
        id: 'sub-subtraction',
        code: 'num_subtraction',
        name: 'Subtraction',
        min_level: null,
        max_level: null,
        level_range: [2, 4],
      },
    ],
  },
  {
    id: 'skl-word-problems',
    code: 'word_problems',
    name: 'Oral & Contextual Word Problems',
    domain: 'numeracy',
    min_level: 4,
    max_level: 5,
    is_core: true,
    subskills: [
      {
        id: 'sub-oral-word-problems',
        code: 'num_oral_word_problems',
        name: 'Oral and contextual word problems',
        min_level: null,
        max_level: null,
        level_range: [4, 5],
      },
    ],
  },
];

export function findSubskillSeed(subskillId: string) {
  for (const skill of skills) {
    const subskill = skill.subskills.find((candidate) => candidate.id === subskillId);
    if (subskill) return { skill, subskill };
  }
  return null;
}
