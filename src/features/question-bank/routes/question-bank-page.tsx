import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  categoryFilterOptions,
  difficultyFilterOptions,
  type QuestionBankEntry,
  questionBankSample,
  subjectFilterOptions,
  workbookSummary,
} from '@/features/question-bank/data/question-bank-fixture';

/**
 * Question Bank (PDF p30 — "Question Bank" / "Browse and select questions to
 * build your assessment."). Left column: filters + browsable question list.
 * Right column: a client-side "Selected Assessment" builder panel. Selection
 * is local component state only — no backend Assessment/Question API exists
 * yet, so nothing here is persisted or submitted (see CLAUDE.md: never guess
 * backend endpoints).
 */
export function QuestionBankPage() {
  const [subject, setSubject] = useState<string>(subjectFilterOptions[0]);
  const [category, setCategory] = useState<string>(categoryFilterOptions[0]);
  const [difficulty, setDifficulty] = useState<string>(difficultyFilterOptions[0]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const filteredQuestions = useMemo(
    () =>
      questionBankSample.filter((entry) => {
        if (subject !== subjectFilterOptions[0] && entry.subject !== subject) return false;
        if (category !== categoryFilterOptions[0] && entry.category !== category) return false;
        if (difficulty !== difficultyFilterOptions[0] && entry.difficulty !== difficulty)
          return false;
        return true;
      }),
    [subject, category, difficulty],
  );

  const selectedQuestions = questionBankSample.filter((entry) => selectedIds.has(entry.id));

  function addQuestion(id: string) {
    setSelectedIds((previous) => new Set(previous).add(id));
  }

  function removeQuestion(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Question Bank</h1>
        <p className="text-koyi-muted mt-1 text-sm">
          Browse and select questions to build your assessment.
        </p>
        <p className="text-koyi-muted mt-1 text-xs">
          {workbookSummary.productionReady} of {workbookSummary.total} workbook questions are
          Production Ready &middot; {workbookSummary.needsReview} need review. Showing a
          representative sample below, not the full workbook.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section
            aria-label="Filters"
            className="rounded-koyi-lg border-koyi-border bg-koyi-card grid grid-cols-1 gap-3 border p-4 sm:grid-cols-3"
          >
            <FilterSelect
              label="Subject"
              value={subject}
              options={subjectFilterOptions}
              onChange={setSubject}
            />
            <FilterSelect
              label="Category"
              value={category}
              options={categoryFilterOptions}
              onChange={setCategory}
            />
            <FilterSelect
              label="Difficulty"
              value={difficulty}
              options={difficultyFilterOptions}
              onChange={setDifficulty}
            />
          </section>

          <ul className="space-y-3">
            {filteredQuestions.map((entry) => (
              <QuestionCard
                key={entry.id}
                entry={entry}
                selected={selectedIds.has(entry.id)}
                onAdd={() => {
                  addQuestion(entry.id);
                }}
              />
            ))}

            {filteredQuestions.length === 0 && (
              <li className="border-koyi-border text-koyi-muted rounded-koyi-lg border border-dashed p-6 text-center text-sm">
                No questions match the current filters.
              </li>
            )}
          </ul>
        </div>

        <aside
          aria-labelledby="selected-assessment-heading"
          className="border-koyi-border bg-koyi-card rounded-koyi-lg h-fit border p-5 lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="selected-assessment-heading" className="text-koyi-text text-base font-semibold">
              Selected Assessment
            </h2>
            <Badge tone={selectedQuestions.length > 0 ? 'info' : 'neutral'}>
              {selectedQuestions.length} selected
            </Badge>
          </div>

          {selectedQuestions.length === 0 ? (
            <p className="text-koyi-muted mt-4 text-sm">
              Add questions from the list to start building this assessment.
            </p>
          ) : (
            <ul className="divide-koyi-border mt-4 divide-y">
              {selectedQuestions.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-koyi-text truncate text-sm font-medium">{entry.id}</p>
                    <p className="text-koyi-muted mt-0.5 line-clamp-2 text-xs">{entry.prompt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeQuestion(entry.id);
                    }}
                    aria-label={`Remove ${entry.id} from selected assessment`}
                    className="text-koyi-danger shrink-0 text-xs font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <Button disabled={selectedQuestions.length === 0} className="w-full">
              Add to Assessment
            </Button>
            <Button
              variant="ghost"
              disabled={selectedQuestions.length === 0}
              onClick={clearAll}
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const selectId = `question-bank-filter-${label.toLowerCase()}`;

  return (
    <div>
      <label htmlFor={selectId} className="text-koyi-muted text-xs font-semibold uppercase">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="border-koyi-border bg-koyi-card text-koyi-text mt-1 h-11 w-full rounded-md border px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function QuestionCard({
  entry,
  selected,
  onAdd,
}: {
  entry: QuestionBankEntry;
  selected: boolean;
  onAdd: () => void;
}) {
  return (
    <li className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-koyi-muted font-mono">{entry.id}</span>
        <Badge tone="neutral">{entry.subject}</Badge>
        <Badge tone="neutral">{entry.category}</Badge>
        <Badge tone="neutral">{entry.difficulty}</Badge>
        <span className="text-koyi-muted rounded-full border border-current px-2 py-0.5 font-mono">
          {entry.technicalType}
        </span>
        {entry.reviewStatus === 'needs-review' && (
          <span title={entry.reviewNote}>
            <Badge tone="warning">Needs review</Badge>
          </span>
        )}
      </div>

      <p className="text-koyi-text mt-2 text-sm">{entry.prompt}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-koyi-muted text-xs">{entry.optionCount} options</span>
        <Button size="sm" variant={selected ? 'secondary' : 'primary'} onClick={onAdd}>
          {selected ? 'Added' : '+ Add'}
        </Button>
      </div>
    </li>
  );
}
