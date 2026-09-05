import { useEffect, useState } from 'react';

import { SearchInput } from '@/components/ui/search-input';
import { SelectField } from '@/components/ui/select-field';
import type { BankQuestion, Skill } from '@/features/teacher/bank/api/bank.schema';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

/**
 * Read-only browse of the question bank, with a "Use this question" action.
 *
 * `frontend-integration.md` §5.2: the bank is read-only to teachers. Picking a
 * question is a **client-side prefill** — the caller fills the authoring form
 * from it and keeps `source_question_id`, and nothing here writes back to the
 * bank.
 */
interface BankPickerProps {
  domain: string;
  skills: Skill[];
  questions: BankQuestion[];
  isLoading: boolean;
  onFilterChange: (filters: { skill?: string | undefined; search?: string | undefined }) => void;
  onUse: (question: BankQuestion) => void;
}

export function BankPicker({
  domain,
  skills,
  questions,
  isLoading,
  onFilterChange,
  onUse,
}: BankPickerProps) {
  const [skillId, setSkillId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const skillOptions = [
    { value: '', label: 'Every skill' },
    ...skills
      .filter((skill) => skill.domain === domain)
      .map((skill) => ({ value: skill.id, label: skill.name })),
  ];

  function applySkill(value: string) {
    setSkillId(value);
    onFilterChange({ skill: value || undefined, search: debouncedSearch || undefined });
  }

  useEffect(() => {
    onFilterChange({ skill: skillId || undefined, search: debouncedSearch || undefined });
    // Only the debounced value should trigger a refetch — the raw `search`
    // state exists purely to keep the input responsive on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="border-koyi-border rounded-koyi-md space-y-3 border p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          label="Search the bank"
          placeholder="Search question text"
          value={search}
          onChange={setSearch}
          className="sm:flex-1"
        />
        <SelectField
          label="Skill"
          labelHidden
          placeholder="Every skill"
          options={skillOptions}
          value={skillId}
          onChange={(event) => {
            applySkill(event.target.value);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-koyi-muted text-sm">Loading…</p>
      ) : questions.length === 0 ? (
        <p className="text-koyi-muted text-sm">No bank questions match yet.</p>
      ) : (
        <ul className="divide-koyi-border max-h-80 divide-y overflow-y-auto">
          {questions.map((question) => (
            <li key={question.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="text-koyi-text text-sm font-medium">{question.content}</p>
                <p className="text-koyi-muted mt-0.5 text-xs">
                  {question.skill_name} · {question.subskill.name} · Level{' '}
                  {String(question.fln_level)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUse(question);
                }}
                className="text-koyi-primary shrink-0 text-sm font-medium hover:underline"
              >
                Use this question
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
