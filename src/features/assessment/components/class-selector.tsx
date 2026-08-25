import type { ClassOption } from '@/features/assessment/data/assessment-setup-fixture';

interface ClassSelectorProps {
  classes: ClassOption[];
  selectedClassId: string;
  onChange: (classId: string) => void;
}

/** Native `<select>` so the class context picker keeps full keyboard/AT semantics. */
export function ClassSelector({ classes, selectedClassId, onChange }: ClassSelectorProps) {
  return (
    <div>
      <label htmlFor="assessment-class-context" className="text-koyi-muted text-sm font-medium">
        Class
      </label>
      <select
        id="assessment-class-context"
        value={selectedClassId}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="border-koyi-border bg-koyi-card text-koyi-text mt-2 h-11 w-full rounded-md border px-3 text-sm"
      >
        {classes.map((classOption) => (
          <option key={classOption.id} value={classOption.id}>
            {classOption.label}
          </option>
        ))}
      </select>
    </div>
  );
}
