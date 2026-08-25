import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { MultipleChoiceAnswer } from '@/features/assessment/components/multiple-choice-answer';
import {
  assessmentQuestions,
  defaultSessionStudentIndex,
  type QuestionResponse,
  sessionStudents,
} from '@/features/assessment/data/assessment-session-fixture';

interface SessionLocationState {
  studentIndex?: number;
}

export function AssessmentSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [studentIndex] = useState(
    () =>
      (location.state as SessionLocationState | null)?.studentIndex ?? defaultSessionStudentIndex,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});

  const student = sessionStudents[studentIndex] ?? sessionStudents[0];
  const question = assessmentQuestions[currentIndex];
  const totalQuestions = assessmentQuestions.length;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  if (!question || !student) {
    return null;
  }

  const response = responses[question.id];
  const hasResponse = response !== undefined;

  function recordResponse(selectedOptionId: string) {
    setResponses((previous) => ({
      ...previous,
      [question!.id]: {
        questionId: question!.id,
        technicalType: 'single_choice',
        selectedOptionId,
      },
    }));
  }

  function goToPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function goToNext() {
    if (isLastQuestion) {
      void navigate(paths.assessment.complete, { state: { studentIndex } });
      return;
    }
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-koyi-muted text-sm font-medium">FLN Assessment</p>
        <h1 className="text-koyi-text text-xl font-semibold">{student.name}</h1>
        <p className="text-koyi-muted text-sm">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
      </header>

      <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6">
        <p className="text-koyi-primary text-xs font-semibold tracking-wide uppercase">
          {question.subject} · {question.skill}
        </p>
        <p className="text-koyi-text mt-3 text-base">{question.prompt}</p>

        <div className="mt-6">
          <MultipleChoiceAnswer
            questionId={question.id}
            options={question.options}
            selected={response?.selectedOptionId}
            onSelect={recordResponse}
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <Button variant="secondary" disabled={isFirstQuestion} onClick={goToPrevious}>
          Previous
        </Button>
        <Button disabled={!hasResponse} onClick={goToNext}>
          {isLastQuestion ? 'Finish Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
