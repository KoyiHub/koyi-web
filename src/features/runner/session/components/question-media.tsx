import type { ReactNode } from 'react';

import {
  BaseTenArt,
  SticksArt,
} from '@/features/runner/session/components/illustrations/diagram-art';
import { SceneArt } from '@/features/runner/session/components/illustrations/scene-art';
import type { QuestionMedia } from '@/features/runner/session/fln-session-fixture';
import { cn } from '@/lib/utils/cn';

/**
 * Renders the picture, diagram, letter or number at the top of a question.
 *
 * One component for every media kind so the question renderers stay about
 * layout, not artwork. When a media block carries an `imageUrl` — real artwork
 * from a designer or the backend — it is shown instead of the drawn fallback,
 * with no other change to the screen.
 */

interface QuestionMediaBlockProps {
  media: QuestionMedia;
  /** Controls layered on the picture, e.g. the Listen chip on question 4. */
  overlay?: ReactNode;
  className?: string;
}

/** A plain-language description for assistive technology. */
function describe(media: QuestionMedia): string {
  switch (media.kind) {
    case 'sticks':
      return `${String(media.count)} counting sticks`;
    case 'base-ten':
      return `${String(media.tens)} tens blocks and ${String(media.ones)} ones blocks`;
    case 'letter':
      return `The letter ${media.upper} in capital and small form`;
    case 'number-badge':
      return `The number ${media.value}`;
    case 'scene':
      return media.caption ?? 'Picture for this question';
  }
}

export function QuestionMediaBlock({ media, overlay, className }: QuestionMediaBlockProps) {
  const description = describe(media);

  if (media.kind === 'letter') {
    return (
      <div
        role="img"
        aria-label={description}
        className={cn(
          'bg-koyi-quiz-tile flex items-center justify-center gap-6 rounded-2xl px-6 py-10',
          className,
        )}
      >
        <span className="font-display text-koyi-text text-7xl leading-none font-extrabold sm:text-8xl">
          {media.upper} {media.lower}
        </span>
      </div>
    );
  }

  if (media.kind === 'number-badge') {
    return (
      <div className={cn('flex justify-center', className)}>
        <div
          role="img"
          aria-label={description}
          className="bg-koyi-quiz-media flex size-40 items-center justify-center rounded-full sm:size-48"
        >
          <span className="font-display text-koyi-quiz-accent text-7xl leading-none font-extrabold sm:text-8xl">
            {media.value}
          </span>
        </div>
      </div>
    );
  }

  if (media.kind === 'sticks' || media.kind === 'base-ten') {
    return (
      <div
        role="img"
        aria-label={description}
        className={cn(
          'bg-koyi-quiz-tile flex min-h-52 items-center justify-center rounded-2xl px-6 py-8',
          className,
        )}
      >
        {media.imageUrl ? (
          <img src={media.imageUrl} alt="" className="max-h-56 w-auto" />
        ) : media.kind === 'sticks' ? (
          <SticksArt count={media.count} />
        ) : (
          <BaseTenArt tens={media.tens} ones={media.ones} />
        )}
      </div>
    );
  }

  const inset = media.frame === 'inset';

  return (
    <figure className={cn('relative', className)}>
      <div
        className={cn(
          'overflow-hidden rounded-2xl',
          inset ? 'bg-koyi-quiz-media p-3 sm:p-4' : 'bg-koyi-quiz-tile',
        )}
      >
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-white">
          {media.imageUrl ? (
            <img src={media.imageUrl} alt={description} className="size-full object-cover" />
          ) : (
            <div role="img" aria-label={description} className="size-full">
              <SceneArt art={media.art} />
            </div>
          )}
        </div>
      </div>

      {media.caption && (
        <figcaption className="font-display text-koyi-text mt-3 text-center text-lg font-bold tracking-wide">
          {media.caption}
        </figcaption>
      )}

      {overlay && <div className="absolute top-4 right-4 sm:top-6 sm:right-6">{overlay}</div>}
    </figure>
  );
}
