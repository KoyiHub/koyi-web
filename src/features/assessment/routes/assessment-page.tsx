import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AssessmentOption } from '@/features/assessment/components/assessment-option';
import { ClassSelector } from '@/features/assessment/components/class-selector';
import { StudentSelector } from '@/features/assessment/components/student-selector';
import {
  type AssessmentTypeId,
  assessmentTypeOptions,
  classOptions,
  defaultAssessmentTypeId,
  defaultClassId,
  studentRoster,
} from '@/features/assessment/data/assessment-setup-fixture';

export function AssessmentPage() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState(defaultClassId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<ReadonlySet<string>>(
    () => new Set(studentRoster.map((student) => student.id)),
  );
  const [assessmentTypeId, setAssessmentTypeId] =
    useState<AssessmentTypeId>(defaultAssessmentTypeId);

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((previous) => {
      const next = new Set(previous);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedStudentIds((previous) =>
      previous.size === studentRoster.length
        ? new Set()
        : new Set(studentRoster.map((student) => student.id)),
    );
  }

  const canStartAssessment = selectedStudentIds.size > 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">
          New Assessment Session
        </h1>
        <p className="text-koyi-muted mt-1 text-sm">
          Configure the class and select students for evaluation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
            <h2 className="text-koyi-text text-base font-semibold">Class Context</h2>
            <div className="mt-3 max-w-sm">
              <ClassSelector
                classes={classOptions}
                selectedClassId={classId}
                onChange={setClassId}
              />
            </div>
          </section>

          <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
            <StudentSelector
              students={studentRoster}
              selectedIds={selectedStudentIds}
              onToggle={toggleStudent}
              onToggleAll={toggleAll}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
            <fieldset>
              <legend className="text-koyi-text text-base font-semibold">Choose Assessment</legend>
              <div className="mt-3 space-y-3">
                {assessmentTypeOptions.map((option) => (
                  <AssessmentOption
                    key={option.id}
                    option={option}
                    selected={assessmentTypeId === option.id}
                    onSelect={() => {
                      setAssessmentTypeId(option.id);
                    }}
                  />
                ))}
              </div>
            </fieldset>
          </section>

          <Button
            className="w-full"
            disabled={!canStartAssessment}
            onClick={() => {
              void navigate(paths.assessment.session);
            }}
          >
            Start Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
