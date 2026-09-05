import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import type { Section } from '@/features/teacher/assessments/api/assessment.schema';
import { useCreateSection, useDeleteSection } from '@/features/teacher/assessments/api/mutations';
import type { Skill } from '@/features/teacher/bank/api/bank.schema';
import { DOMAIN_LABEL } from '@/lib/fln/level';

/**
 * Step 2 — sections. A **section is one sitting**: one domain, whatever skills
 * the teacher chose, mixed levels, taken as its own timed unit.
 *
 * `covers` declares what a section is *meant* to probe and is what the
 * coverage panel's "gaps" warning is checked against — it is not the same as
 * which questions actually ended up in the section.
 */
interface SectionEditorProps {
  assessmentId: string;
  sections: Section[];
  skills: Skill[];
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

export function SectionEditor({
  assessmentId,
  sections,
  skills,
  activeSectionId,
  onSelectSection,
}: SectionEditorProps) {
  const coversId = useId();
  const [domain, setDomain] = useState('literacy');
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [covers, setCovers] = useState<string[]>([]);

  const createSection = useCreateSection(assessmentId);
  const deleteSection = useDeleteSection(assessmentId);

  const domainSkills = skills.filter((skill) => skill.domain === domain);
  const subskillOptions = domainSkills.flatMap((skill) =>
    skill.subskills.map((subskill) => ({
      value: subskill.id,
      label: `${skill.name} — ${subskill.name}`,
    })),
  );

  async function handleAdd() {
    if (!name.trim()) return;
    const created = await createSection.mutateAsync({
      domain,
      name: name.trim(),
      instructions: instructions.trim(),
      timer: null,
      covers,
    });
    setName('');
    setInstructions('');
    setCovers([]);
    onSelectSection(created.id);
  }

  return (
    <div className="space-y-6">
      {sections.length > 0 && (
        <ul className="space-y-2">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`rounded-koyi-md flex items-center justify-between border p-3 ${
                section.id === activeSectionId
                  ? 'border-koyi-primary bg-koyi-primary/5'
                  : 'border-koyi-border'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectSection(section.id);
                }}
                className="flex-1 text-left"
              >
                <p className="text-koyi-text text-sm font-medium">{section.name}</p>
                <p className="text-koyi-muted text-xs">
                  {DOMAIN_LABEL[section.domain]} · {section.question_count} question
                  {section.question_count === 1 ? '' : 's'}
                  {section.timer && ` · ${section.timer}`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  void deleteSection.mutateAsync(section.id);
                }}
                aria-label={`Delete ${section.name}`}
                className="text-koyi-muted hover:text-koyi-danger p-2"
              >
                <TrashIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-koyi-border rounded-koyi-md space-y-3 border border-dashed p-4">
        <p className="text-koyi-text text-sm font-medium">Add a section</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField
            label="Domain"
            options={[
              { value: 'literacy', label: 'Literacy' },
              { value: 'numeracy', label: 'Numeracy' },
            ]}
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
              setCovers([]);
            }}
          />
          <TextField
            label="Name"
            placeholder="Reading"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <TextField
          label="Instructions (read to the child)"
          placeholder="Read each word aloud."
          value={instructions}
          onChange={(event) => {
            setInstructions(event.target.value);
          }}
        />
        <div>
          <label htmlFor={coversId} className="text-koyi-text mb-1.5 block text-sm font-medium">
            Covers (drives the coverage warning)
          </label>
          <select
            id={coversId}
            multiple
            value={covers}
            onChange={(event) => {
              setCovers(Array.from(event.target.selectedOptions, (option) => option.value));
            }}
            className="border-koyi-border rounded-koyi-md h-32 w-full border bg-white p-2 text-sm"
          >
            {subskillOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          onClick={() => void handleAdd()}
          isLoading={createSection.isPending}
          disabled={!name.trim()}
        >
          <PlusIcon className="size-4" />
          Add section
        </Button>
      </div>
    </div>
  );
}
