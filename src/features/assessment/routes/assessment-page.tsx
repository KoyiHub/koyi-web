import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

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
            <SectionHeading step={1} title="Select Class Context" />
            <div className="mt-3 max-w-sm">
              <ClassSelector
                classes={classOptions}
                selectedClassId={classId}
                onChange={setClassId}
              />
            </div>
          </section>

          <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
            <SectionHeading step={2} title="Select Students" />
            <div className="mt-3">
              <StudentSelector
                students={studentRoster}
                selectedIds={selectedStudentIds}
                onToggle={toggleStudent}
                onToggleAll={toggleAll}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
            <SectionHeading step={3} title="Choose Assessment" />
            <fieldset className="mt-3">
              <legend className="sr-only">Choose Assessment</legend>
              <div className="space-y-3">
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

            <Link
              to={paths.questionBank}
              className="rounded-koyi-lg border-koyi-primary/30 bg-koyi-primary/5 text-koyi-primary hover:bg-koyi-primary/10 mt-4 flex h-11 items-center justify-between gap-2 border px-3.5 text-sm font-medium transition-colors"
            >
              Browse the Question Bank
              <span aria-hidden="true">&rarr;</span>
            </Link>
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

/** Numbered section indicator matching PDF p36's "1 / 2 / 3" step markers. */
function SectionHeading({ step, title }: { step: number; title: string }) {
  return (
    <h2 className="text-koyi-text flex items-center gap-2.5 text-base font-semibold">
      <span
        aria-hidden="true"
        className="bg-koyi-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      >
        {step}
      </span>
      {title}
    </h2>
  );
}
