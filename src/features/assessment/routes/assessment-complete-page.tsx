import { useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import {
  defaultSessionStudentIndex,
  sessionStudents,
} from '@/features/assessment/data/assessment-session-fixture';

interface CompleteLocationState {
  studentIndex?: number;
}

export function AssessmentCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const studentIndex =
    (location.state as CompleteLocationState | null)?.studentIndex ?? defaultSessionStudentIndex;
  const student = sessionStudents[studentIndex] ?? sessionStudents[0];

  if (!student) {
    return null;
  }

  const nextStudentIndex = (studentIndex + 1) % sessionStudents.length;

  return (
    <section className="rounded-koyi-lg border-koyi-border bg-koyi-card mx-auto max-w-xl border p-8 text-center">
      <h1 className="text-koyi-text text-xl font-semibold">Assessment Complete</h1>
      <p className="text-koyi-muted mt-2 text-sm">
        {`${student.name}'s responses have been recorded.`}
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          onClick={() => {
            void navigate(paths.teacher.assessment.setup);
          }}
        >
          Return to Assessment Setup
        </Button>
        <Button
          onClick={() => {
            void navigate(paths.teacher.assessment.session, {
              state: { studentIndex: nextStudentIndex },
            });
          }}
        >
          Assess Next Student
        </Button>
      </div>
    </section>
  );
}
