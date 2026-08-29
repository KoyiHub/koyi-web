import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SelectField } from '@/components/ui/select-field';
import {
  type AssessmentFilters,
  DIFFICULTY_OPTIONS,
  GRADE_OPTIONS,
  NO_FILTERS,
  STATUS_OPTIONS,
  SUBJECT_OPTIONS,
} from '@/features/teacher/assessments/lib/filters';

interface AssessmentFilterModalProps {
  open: boolean;
  onClose: () => void;
  value: AssessmentFilters;
  onApply: (filters: AssessmentFilters) => void;
}

/**
 * The library's Filter dialog.
 *
 * Choices are held locally until Apply, so a teacher can change their mind
 * without the list flickering underneath them, and Cancel genuinely cancels.
 * Opening the dialog resets the local copy to whatever is currently applied.
 */
export function AssessmentFilterModal({
  open,
  onClose,
  value,
  onApply,
}: AssessmentFilterModalProps) {
  const [draft, setDraft] = useState(value);
  const [wasOpen, setWasOpen] = useState(open);

  // Reset the local copy on the render that opens the dialog rather than in an
  // effect, so the first frame a teacher sees already matches the applied
  // filters instead of the choices they abandoned last time.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  const update = (key: keyof AssessmentFilters) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [key]: event.target.value }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter assessments"
      description="Narrow the library down to what you are looking for."
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(NO_FILTERS);
            }}
          >
            Clear all
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(draft);
              }}
            >
              Apply filter
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Subject"
          value={draft.subject}
          onChange={update('subject')}
          options={SUBJECT_OPTIONS}
        />
        <SelectField
          label="Grade level"
          value={draft.grade}
          onChange={update('grade')}
          options={GRADE_OPTIONS}
        />
        <SelectField
          label="Status"
          value={draft.status}
          onChange={update('status')}
          options={STATUS_OPTIONS}
        />
        <SelectField
          label="Difficulty"
          value={draft.difficulty}
          onChange={update('difficulty')}
          options={DIFFICULTY_OPTIONS}
        />
      </div>
    </Modal>
  );
}

export { DIFFICULTY_OPTIONS };
