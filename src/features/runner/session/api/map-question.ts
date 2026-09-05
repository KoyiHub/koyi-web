import type {
  RunnerContent,
  RunnerOption,
  RunnerQuestion,
} from '@/features/runner/api/runner.schema';
import type {
  ChoiceQuestion,
  ComparisonQuestion,
  FlnQuestion,
  OptionShape,
  PassageQuestion,
  QuestionMedia,
  QuizOption,
  SpokenQuestion,
  StoryQuestion,
} from '@/features/runner/session/question-types';
import type { Domain } from '@/lib/api/contracts';

/**
 * Builds the player's own `FlnQuestion` from what `start/` actually sends.
 *
 * The contract's five layouts (§6) don't line up one-to-one with the
 * renderers built for the delivered designs — `refactor-plan.md`'s Phase 2
 * writeup has the full mapping table this follows. The renderers keep their
 * visual structure; only the data feeding them changes shape here.
 */
export function mapRunnerQuestion(
  question: RunnerQuestion,
  sectionName: string,
  domain: Domain,
): FlnQuestion {
  const base = {
    id: question.id,
    section: sectionName,
    subject: DOMAIN_SUBJECT[domain],
    subskillName: question.subskill_name,
  };

  if (question.layout === 'speech_response_prompt') {
    return mapSpoken(base, question);
  }
  if (question.layout === 'comparison_panel_choice') {
    return mapComparison(base, question);
  }
  if (question.layout === 'passage_comprehension_choice') {
    return mapPassageOrStory(base, question);
  }
  return mapChoice(base, question);
}

const DOMAIN_SUBJECT: Record<Domain, 'Literacy' | 'Numeracy'> = {
  literacy: 'Literacy',
  numeracy: 'Numeracy',
};

interface Base {
  id: string;
  section: string;
  subject: 'Literacy' | 'Numeracy';
  subskillName: string;
}

function byOrder(contents: RunnerContent[]): RunnerContent[] {
  return [...contents].sort((a, b) => a.display_order - b.display_order);
}

function toOption(option: RunnerOption): QuizOption {
  const imageUrl = option.media?.type === 'image' ? option.media.url : undefined;
  return { id: option.id, label: option.value, ...(imageUrl ? { imageUrl } : {}) };
}

/** The first image content, in order — the picture, diagram or scene for this question. */
function mediaBlock(contents: RunnerContent[]): QuestionMedia | undefined {
  const image = byOrder(contents).find((content) => content.type === 'image' && content.media);
  if (!image?.media) return undefined;
  const caption = image.caption ?? undefined;
  return {
    kind: 'scene',
    imageUrl: image.media.url,
    frame: 'plain',
    ...(caption ? { caption } : {}),
  };
}

function firstText(contents: RunnerContent[]): string | undefined {
  const text = byOrder(contents).find((content) => content.type === 'text' && content.text_content);
  return text?.text_content ?? undefined;
}

function optionShapeFor(options: RunnerOption[]): OptionShape {
  if (options.some((option) => option.media?.type === 'image')) return 'image-tile';
  if (options.some((option) => option.value.length > 12)) return 'list';
  return 'tile';
}

function mapSpoken(base: Base, question: RunnerQuestion): SpokenQuestion {
  const audio = byOrder(question.contents).find((content) => content.type === 'audio');
  const spokenText = firstText(question.contents) ?? question.text;
  const audioUrl = audio?.media?.url;

  return {
    ...base,
    layout: 'spoken',
    media: mediaBlock(question.contents),
    sentence: { text: spokenText },
    instruction: question.text,
    listen: { text: spokenText, ...(audioUrl ? { audioUrl } : {}) },
    listenPlacement: 'beside-mic',
    micLabel: 'Tap and say it',
  };
}

function mapComparison(base: Base, question: RunnerQuestion): ComparisonQuestion {
  return {
    ...base,
    layout: 'comparison',
    prompt: question.text,
    options: question.options.map(toOption),
  };
}

/**
 * `passage_comprehension_choice` covers two visually different screens — a
 * short retelling with a handful of thumbnails, and a longer passage read
 * beside the question. Chosen from content shape, since the contract sends
 * no flag: more than one image reads as a picture sequence; a long body of
 * text reads as a passage either way.
 */
function mapPassageOrStory(base: Base, question: RunnerQuestion): StoryQuestion | PassageQuestion {
  const paragraphs = byOrder(question.contents)
    .filter((content) => content.type === 'text' && content.text_content)
    .map((content) => content.text_content ?? '');
  const images = byOrder(question.contents).filter(
    (content) => content.type === 'image' && content.media,
  );
  const passageLength = paragraphs.join(' ').length;

  if (images.length > 1 && passageLength < 220) {
    return {
      ...base,
      layout: 'story',
      storyTitle: 'Short Story',
      storyBody: paragraphs.join(' '),
      thumbnails: images.map((content, index) => {
        const imageUrl = content.media?.url;
        return {
          id: `${question.id}-thumb-${String(index)}`,
          alt: content.caption ?? `Picture ${String(index + 1)}`,
          ...(imageUrl ? { imageUrl } : {}),
        };
      }),
      prompt: question.text,
      options: question.options.map(toOption),
    };
  }

  return {
    ...base,
    layout: 'passage',
    media: mediaBlock(question.contents),
    passageTitle: 'Reading Passage',
    passageBody: paragraphs.length > 0 ? paragraphs : [question.text],
    prompt: question.text,
    options: question.options.map(toOption),
  };
}

function mapChoice(base: Base, question: RunnerQuestion): ChoiceQuestion {
  return {
    ...base,
    layout: 'choice',
    media: mediaBlock(question.contents),
    prompt: question.text,
    promptPlacement: 'above-media',
    optionShape:
      question.layout === 'media_list_choice' ? 'list' : optionShapeFor(question.options),
    options: question.options.map(toOption),
    columns: question.options.length > 3 ? 4 : 2,
  };
}
