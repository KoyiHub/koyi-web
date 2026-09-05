import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { skillsQuery } from '@/features/teacher/bank/api/queries';
import type { Criterion, CriterionType } from '@/features/teacher/groups/api/group.schema';
import { useCreateGroup } from '@/features/teacher/groups/api/mutations';
import { ApiError } from '@/lib/api/errors';
import { DOMAIN_LABEL } from '@/lib/fln/level';

interface DraftCriterion {
  type: CriterionType;
  level: string;
  comparator: 'eq' | 'gte' | 'lte';
  skill: string;
  subskill: string;
}

function emptyCriterion(): DraftCriterion {
  return { type: 'level', level: '2', comparator: 'eq', skill: '', subskill: '' };
}

function toCriterion(draft: DraftCriterion): Criterion | null {
  if (draft.type === 'level') {
    const level = Number(draft.level);
    if (!level) return null;
    return { type: 'level', level: level as Criterion['level'], comparator: draft.comparator };
  }
  if (draft.type === 'skill') {
    if (!draft.skill) return null;
    return { type: 'skill', skill: draft.skill };
  }
  if (draft.type === 'subskill') {
    if (!draft.subskill) return null;
    return { type: 'subskill', subskill: draft.subskill };
  }
  return null;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (groupId: string) => void;
}

/**
 * Criteria on level, skill, subskill and class — all optional, all ANDed. A
 * group with no criteria matches nobody, deliberately (§5.6), so the create
 * button stays disabled until at least one criterion resolves. There is no
 * `class` option here: a teacher has exactly one homeroom class (§5.6), and
 * no documented endpoint hands back its id to filter by.
 */
export function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<'literacy' | 'numeracy'>('literacy');
  const [resourceTier, setResourceTier] = useState<'minimal' | 'basic' | 'equipped'>('basic');
  const [criteria, setCriteria] = useState<DraftCriterion[]>([emptyCriterion()]);

  const skills = useQuery({ ...skillsQuery(domain), enabled: open });
  const create = useCreateGroup();

  const resolvedCriteria = criteria.map(toCriterion).filter((entry): entry is Criterion => !!entry);

  function updateCriterion(index: number, patch: Partial<DraftCriterion>) {
    setCriteria((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)),
    );
  }

  function handleCreate() {
    create.mutate(
      { name, domain, resource_tier: resourceTier, criteria: resolvedCriteria },
      {
        onSuccess: (group) => {
          onCreated(group.id);
          setName('');
          setCriteria([emptyCriterion()]);
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a group"
      description="Criteria are ANDed — a child must match every one to be placed here."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={create.isPending}
            disabled={!name || resolvedCriteria.length === 0}
            onClick={handleCreate}
          >
            Create group
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Group name *"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Domain *"
            value={domain}
            options={[
              { value: 'literacy', label: DOMAIN_LABEL.literacy },
              { value: 'numeracy', label: DOMAIN_LABEL.numeracy },
            ]}
            onChange={(event) => {
              setDomain(event.target.value as 'literacy' | 'numeracy');
            }}
          />
          <SelectField
            label="Resources *"
            value={resourceTier}
            options={[
              { value: 'minimal', label: 'Minimal — chalkboard and voice' },
              { value: 'basic', label: 'Basic — paper, printed materials' },
              { value: 'equipped', label: 'Equipped — manipulatives, some devices' },
            ]}
            onChange={(event) => {
              setResourceTier(event.target.value as 'minimal' | 'basic' | 'equipped');
            }}
          />
        </div>

        <div className="space-y-3">
          <p className="text-koyi-text text-sm font-semibold">Criteria</p>
          {criteria.map((criterion, index) => (
            <div key={index} className="border-koyi-border rounded-md border p-3">
              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Type"
                  labelHidden
                  value={criterion.type}
                  options={[
                    { value: 'level', label: 'Level' },
                    { value: 'skill', label: 'Skill' },
                    { value: 'subskill', label: 'Subskill' },
                  ]}
                  onChange={(event) => {
                    updateCriterion(index, { type: event.target.value as CriterionType });
                  }}
                />

                {criterion.type === 'level' && (
                  <div className="flex gap-2">
                    <SelectField
                      label="Comparator"
                      labelHidden
                      value={criterion.comparator}
                      options={[
                        { value: 'eq', label: '= exactly' },
                        { value: 'gte', label: '≥ at least' },
                        { value: 'lte', label: '≤ at most' },
                      ]}
                      onChange={(event) => {
                        updateCriterion(index, {
                          comparator: event.target.value as DraftCriterion['comparator'],
                        });
                      }}
                    />
                    <SelectField
                      label="Level"
                      labelHidden
                      value={criterion.level}
                      options={[1, 2, 3, 4, 5].map((level) => ({
                        value: String(level),
                        label: `Level ${String(level)}`,
                      }))}
                      onChange={(event) => {
                        updateCriterion(index, { level: event.target.value });
                      }}
                    />
                  </div>
                )}

                {criterion.type === 'skill' && (
                  <SelectField
                    label="Skill"
                    labelHidden
                    placeholder="Select a skill"
                    value={criterion.skill}
                    options={(skills.data ?? []).map((skill) => ({
                      value: skill.id,
                      label: skill.name,
                    }))}
                    onChange={(event) => {
                      updateCriterion(index, { skill: event.target.value });
                    }}
                  />
                )}

                {criterion.type === 'subskill' && (
                  <SelectField
                    label="Subskill"
                    labelHidden
                    placeholder="Select a subskill"
                    value={criterion.subskill}
                    options={(skills.data ?? []).flatMap((skill) =>
                      skill.subskills.map((subskill) => ({
                        value: subskill.id,
                        label: `${skill.name} — ${subskill.name}`,
                      })),
                    )}
                    onChange={(event) => {
                      updateCriterion(index, { subskill: event.target.value });
                    }}
                  />
                )}
              </div>

              {criteria.length > 1 && (
                <button
                  type="button"
                  className="text-koyi-danger mt-2 text-xs font-semibold hover:underline"
                  onClick={() => {
                    setCriteria((current) =>
                      current.filter((_, entryIndex) => entryIndex !== index),
                    );
                  }}
                >
                  Remove criterion
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="text-koyi-primary text-sm font-semibold hover:underline"
            onClick={() => {
              setCriteria((current) => [...current, emptyCriterion()]);
            }}
          >
            + Add another criterion
          </button>
        </div>

        {create.isError && (
          <p role="alert" className="text-koyi-danger text-sm">
            {create.error instanceof ApiError
              ? create.error.message
              : 'Could not create the group.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
