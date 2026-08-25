import type { StudentOption } from '@/features/assessment/data/assessment-setup-fixture';

interface StudentSelectorProps {
  students: StudentOption[];
  selectedIds: ReadonlySet<string>;
  onToggle: (studentId: string) => void;
  onToggleAll: () => void;
}

/**
 * Real checkboxes with clickable `<label for>` pairing — no custom widget, so
 * native keyboard/AT behaviour comes for free.
 */
export function StudentSelector({
  students,
  selectedIds,
  onToggle,
  onToggleAll,
}: StudentSelectorProps) {
  const allSelected =
    students.length > 0 && students.every((student) => selectedIds.has(student.id));

  return (
    <fieldset>
      <legend className="text-koyi-text text-base font-semibold">Select Students</legend>

      <div className="mt-3 flex items-center justify-between gap-4">
        <label className="text-koyi-text flex h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            className="border-koyi-border size-5 rounded"
          />
          Select all
        </label>

        <span className="text-koyi-muted text-sm">
          {selectedIds.size} of {students.length} selected
        </span>
      </div>

      <ul className="divide-koyi-border mt-2 divide-y">
        {students.map((student) => {
          const inputId = `assessment-student-${student.id}`;

          return (
            <li key={student.id} className="flex items-center gap-3 py-2">
              <input
                id={inputId}
                type="checkbox"
                checked={selectedIds.has(student.id)}
                onChange={() => {
                  onToggle(student.id);
                }}
                className="border-koyi-border size-5 shrink-0 rounded"
              />
              <label
                htmlFor={inputId}
                className="text-koyi-text flex h-11 flex-1 items-center text-sm"
              >
                {student.name}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
