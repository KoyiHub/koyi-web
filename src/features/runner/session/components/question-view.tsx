import { ChoiceQuestionView } from '@/features/runner/session/components/questions/choice-question';
import { ComparisonQuestionView } from '@/features/runner/session/components/questions/comparison-question';
import { PassageQuestionView } from '@/features/runner/session/components/questions/passage-question';
import type { QuestionViewProps } from '@/features/runner/session/components/questions/question-props';
import { SpokenQuestionView } from '@/features/runner/session/components/questions/spoken-question';
import { StoryQuestionView } from '@/features/runner/session/components/questions/story-question';
import type { FlnQuestion } from '@/features/runner/session/question-types';

/**
 * Picks the renderer for a question's layout.
 *
 * The `layout` field is the discriminant on `FlnQuestion`, so TypeScript
 * narrows each branch and a new layout cannot be added without a renderer
 * for it.
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
  }
}
