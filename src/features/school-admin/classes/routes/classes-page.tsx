import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';

import { buttonClasses } from '@/components/ui/button-variants';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ArrowRightIcon, LayersIcon, PlusIcon } from '@/components/ui/icons';
import { PageHeader } from '@/components/ui/page-header';
import { PageSpinner } from '@/components/ui/page-spinner';
import { SelectField } from '@/components/ui/select-field';
import { paths } from '@/config/paths';
import { gradesQuery } from '@/features/school-admin/api/queries';
import type { ClassListItem } from '@/features/school-admin/classes/api/class.schema';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { cn } from '@/lib/utils/cn';

function ScoreBar({ label, value, barClass }: { label: string; value: number; barClass: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-koyi-muted text-xs font-medium">{label}</span>
        <span className="text-koyi-text text-xs font-bold">{value}%</span>
      </div>
      <div
        className="bg-koyi-nav-active mt-1.5 h-2 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${label}: ${String(value)} percent`}
      >
        <div
          className={cn('h-full rounded-full', barClass)}
          style={{ width: `${String(value)}%` }}
        />
      </div>
    </div>
  );
}

function ClassCard({ schoolClass }: { schoolClass: ClassListItem }) {
  const formTeacher = schoolClass.teachers.find((teacher) => teacher.is_form_teacher);
  const otherTeacherCount = schoolClass.teachers.length - (formTeacher ? 1 : 0);

  return (
    <article className="rounded-koyi-xl border-koyi-border bg-koyi-card flex flex-col border p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-koyi-nav-active text-koyi-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold">
          <span aria-hidden="true" className="bg-koyi-primary size-1.5 rounded-full" />
          {schoolClass.grade_name}
        </span>
        <span className="text-koyi-muted text-xs font-medium">{schoolClass.term}</span>
      </div>

      <h2 className="text-koyi-text font-display mt-3 text-xl font-extrabold">
        {schoolClass.name}
      </h2>
      <p className="text-koyi-muted mt-1 text-xs">
        {formTeacher ? `Form teacher: ${formTeacher.full_name}` : 'No form teacher assigned'}
        {otherTeacherCount > 0 && ` · +${String(otherTeacherCount)} more`}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-koyi-sidebar rounded-koyi-md p-3">
          <p className="text-koyi-muted text-xs font-medium">Students</p>
          <p className="text-koyi-text font-display mt-0.5 text-xl font-extrabold">
            {schoolClass.student_count}
          </p>
        </div>
        <div className="bg-koyi-sidebar rounded-koyi-md p-3">
          <p className="text-koyi-muted text-xs font-medium">Avg Score</p>
          <p className="text-koyi-primary font-display mt-0.5 text-xl font-extrabold">
            {schoolClass.average_score}%
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ScoreBar label="Literacy" value={schoolClass.literacy_score} barClass="bg-koyi-primary" />
        <ScoreBar
          label="Numeracy"
          value={schoolClass.numeracy_score}
          barClass="bg-koyi-band-strong"
        />
      </div>

      <div className="border-koyi-border mt-5 border-t pt-4">
        <Link
          to={paths.schoolAdmin.classes.detail(schoolClass.id)}
          className={cn(buttonClasses('secondary'), 'w-full')}
        >
          View Class
          <ArrowRightIcon aria-hidden="true" className="size-4" />
          <span className="sr-only"> {schoolClass.display_name}</span>
        </Link>
      </div>
    </article>
  );
}

/**
 * Classes overview (design reference page 12), refined onto the class model:
 * grade and class name are separate fields, and a class carries several
 * teachers with one form teacher.
 */
export function ClassesPage() {
  const [gradeId, setGradeId] = useState('all');

  const grades = useQuery(gradesQuery());
  const classes = useQuery(classListQuery({ gradeId }));

  const gradeOptions = [
    { value: 'all', label: 'All grades' },
    ...(grades.data ?? []).map((grade) => ({ value: grade.id, label: grade.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Total Classes"
        subtitle="Overview of literacy and numeracy metrics across classes."
        actions={
          <>
            <SelectField
              label="Filter by grade"
              labelHidden
              options={gradeOptions}
              value={gradeId}
              onChange={(event) => {
                setGradeId(event.target.value);
              }}
              wrapperClassName="w-48"
            />
            <Link to={paths.schoolAdmin.classes.new} className={cn(buttonClasses(), 'shrink-0')}>
              <PlusIcon aria-hidden="true" className="size-4" />
              Add Class
            </Link>
          </>
        }
      />

      {classes.isPending && <PageSpinner />}

      {classes.isError && (
        <ErrorState
          error={classes.error}
          onRetry={() => {
            void classes.refetch();
          }}
        />
      )}

      {classes.data &&
        (classes.data.results.length === 0 ? (
          <EmptyState
            icon={<LayersIcon className="size-5" />}
            title="No classes in this grade yet."
            description="Create a class to start assigning teachers and enrolling students."
            action={
              <Link to={paths.schoolAdmin.classes.new} className={buttonClasses()}>
                <PlusIcon aria-hidden="true" className="size-4" />
                Add Class
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classes.data.results.map((schoolClass) => (
              <ClassCard key={schoolClass.id} schoolClass={schoolClass} />
            ))}
          </div>
        ))}
    </div>
  );
}
