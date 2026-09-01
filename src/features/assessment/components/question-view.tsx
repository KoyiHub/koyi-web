import { ChoiceQuestionView } from '@/features/assessment/components/questions/choice-question';
import { ComparisonQuestionView } from '@/features/assessment/components/questions/comparison-question';
import { PassageQuestionView } from '@/features/assessment/components/questions/passage-question';
import type { QuestionViewProps } from '@/features/assessment/components/questions/question-props';
import { ReviewQuestionView } from '@/features/assessment/components/questions/review-question';
import { SpokenQuestionView } from '@/features/assessment/components/questions/spoken-question';
import { StoryQuestionView } from '@/features/assessment/components/questions/story-question';
import type { FlnQuestion } from '@/features/assessment/data/fln-session-fixture';

/**
 * Picks the renderer for a question's layout.
 *
 * The `layout` field is the discriminant on `FlnQuestion`, so TypeScript
 * narrows each branch and a new layout cannot be added to the fixture without
 * a renderer for it.
 */
export function QuestionView(props: QuestionViewProps<FlnQuestion>) {
  const { question } = props;

  switch (question.layout) {
    case 'choice':
      return <ChoiceQuestionView {...props} question={question} />;
    case 'spoken':
      return <SpokenQuestionView {...props} question={question} />;
    case 'comparison':
      return <ComparisonQuestionView {...props} question={question} />;
    case 'story':
      return <StoryQuestionView {...props} question={question} />;
    case 'passage':
      return <PassageQuestionView {...props} question={question} />;
    case 'review':
      return <ReviewQuestionView {...props} question={question} />;
  }
}
