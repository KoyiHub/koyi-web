import { Link } from 'react-router';

import { paths } from '@/config/paths';
import type { ClassDashboard } from '@/features/dashboard/data/dashboard-fixture';

interface StudentsNeedingAttentionProps {
  dashboard: ClassDashboard;
}

export function StudentsNeedingAttention({ dashboard }: StudentsNeedingAttentionProps) {
  return (
    <section
      aria-labelledby="students-needing-attention-heading"
      className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5"
    >
      <div className="flex items-center justify-between">
        <h2
          id="students-needing-attention-heading"
          className="text-koyi-text text-lg font-semibold"
        >
          Students Needing Attention
        </h2>
        <Link
          to={paths.students.list}
          className="text-koyi-primary text-sm font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-150 text-left text-sm">
          <thead className="border-koyi-border border-b">
            <tr className="text-koyi-muted text-xs tracking-wide uppercase">
              <th className="py-2 pr-4 font-semibold">Student</th>
              <th className="py-2 pr-4 font-semibold">Primary Gap</th>
              <th className="py-2 pr-4 font-semibold">Last Assessed</th>
              <th className="py-2 pr-0 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-koyi-border divide-y">
            {dashboard.studentsNeedingAttention.map((student) => (
              <tr key={student.studentId}>
                <td className="text-koyi-text py-3 pr-4 font-medium">{student.name}</td>
                <td className="text-koyi-danger py-3 pr-4">{student.primaryGap}</td>
                <td className="text-koyi-muted py-3 pr-4">{student.lastAssessed}</td>
                <td className="py-3 pr-0">
                  <Link
                    to={paths.students.detail(student.studentId)}
                    className="text-koyi-primary font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
