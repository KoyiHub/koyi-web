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
import type { SchoolClass } from '@/features/school-admin/classes/api/class.schema';
import { classListQuery } from '@/features/school-admin/classes/api/queries';
import { cn } from '@/lib/utils/cn';

function ClassCard({ schoolClass }: { schoolClass: SchoolClass }) {
  return (
    <article className="rounded-koyi-xl border-koyi-border bg-koyi-card flex flex-col border p-5">
      <span className="bg-koyi-nav-active text-koyi-primary inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-bold">
        <span aria-hidden="true" className="bg-koyi-primary size-1.5 rounded-full" />
        {schoolClass.grade_name}
      </span>

      <h2 className="text-koyi-text font-display mt-3 text-xl font-extrabold">
        {schoolClass.name}
      </h2>

      <div className="mt-5">
        <Link
          to={paths.schoolAdmin.classes.detail(schoolClass.id)}
          className={cn(buttonClasses('secondary'), 'w-full')}
        >
          View Class
          <ArrowRightIcon aria-hidden="true" className="size-4" />
          <span className="sr-only"> {schoolClass.label}</span>
        </Link>
      </div>
    </article>
  );
}

/**
 * Classes overview — `frontend-integration.md` §4.3. Grade and class name
 * are separate fields (grades are ours, classes are the school's own arm
 * within one), which is what makes Add Class a grade select plus a name
 * field. **Unpaginated** — the whole filtered list arrives in one call.
 */
export function ClassesPage() {
  const [gradeId, setGradeId] = useState('all');

  const grades = useQuery(gradesQuery());
  const classes = useQuery(classListQuery(gradeId));

  const gradeOptions = [
    { value: 'all', label: 'All grades' },
    ...(grades.data ?? []).map((grade) => ({ value: grade.id, label: grade.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        subtitle="Every class this school runs."
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
        (classes.data.length === 0 ? (
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
            {classes.data.map((schoolClass) => (
              <ClassCard key={schoolClass.id} schoolClass={schoolClass} />
            ))}
          </div>
        ))}
    </div>
  );
}
