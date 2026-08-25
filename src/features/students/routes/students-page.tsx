import { useState } from 'react';

import { LevelFilter, type LevelFilterValue } from '@/features/students/components/level-filter';
import { StudentCard } from '@/features/students/components/student-card';
import { StudentsGroupsNav } from '@/features/students/components/students-groups-nav';
import { classContext, students } from '@/features/students/data/students-fixture';

export function StudentsPage() {
  const [levelFilter, setLevelFilter] = useState<LevelFilterValue>('all');

  const visibleStudents =
    levelFilter === 'all' ? students : students.filter((student) => student.level === levelFilter);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <StudentsGroupsNav />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-koyi-text text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-koyi-muted mt-1 text-sm">
            Manage and monitor student reading and numeracy progress.
          </p>
          <p className="text-koyi-primary mt-2 text-xs font-semibold tracking-wide uppercase">
            {classContext}
          </p>
        </div>
      </header>

      <LevelFilter value={levelFilter} onChange={setLevelFilter} />

      {visibleStudents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="rounded-koyi-lg border-koyi-border bg-koyi-card border border-dashed p-8 text-center">
          <p className="text-koyi-text text-sm font-medium">No students match this filter.</p>
          <p className="text-koyi-muted mt-1 text-sm">Try a different level, or select All.</p>
        </div>
      )}
    </div>
  );
}
