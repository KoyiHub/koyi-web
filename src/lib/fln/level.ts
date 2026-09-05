import type { Domain, FlnLevel, MovementDirection } from '@/lib/api/contracts';

/**
 * How an FLN level is put into words. One module, because the phrasing is easy
 * to get wrong and the wrong phrasing misrepresents a child.
 *
 * Placement returns **the lowest level the paper probed that the child did not
 * pass** — so a level says what to teach next, not what has been mastered. A
 * child who fails Level 3 while passing Level 4 is placed at 3, because 3 is
 * the gap.
 *
 * That is why nothing in this app renders a bare `Level {n}`, and why there is
 * no helper here that returns one: read on its own, a bare level reads as an
 * achievement, which is the opposite of what it means.
 *
 * Two further rules from `frontend-integration.md` §9 are enforced by what this
 * module does *not* offer:
 *
 * - No combined level. Literacy and numeracy move independently, so every
 *   helper that names a level takes a `domain` alongside it.
 * - No ranking words. There is no "strong", "weak", "behind" or "ahead" here.
 */

/** The chip and heading form. "Working on Level 2" — never "Level 2 ✓". */
export function levelLabel(level: FlnLevel): string {
  return `Working on Level ${String(level)}`;
}

/** The supporting sentence under a level chip. */
export function levelCaption(level: FlnLevel): string {
  return `Needs teaching at Level ${String(level)}`;
}

/** Domain in prose. Kept here so the two are always written the same way. */
export const DOMAIN_LABEL: Record<Domain, string> = {
  literacy: 'Literacy',
  numeracy: 'Numeracy',
};

/** "Literacy — Working on Level 2". Use wherever both matter, which is most places. */
export function domainLevelLabel(domain: Domain, level: FlnLevel): string {
  return `${DOMAIN_LABEL[domain]} — ${levelLabel(level)}`;
}

/**
 * How a change in level is described.
 *
 * Deliberately neutral in both directions. Placement is absolute, so a child
 * can move down and that is a reading of where they are now — not a regression
 * to soften, explain away, or mark in red.
 */
export const MOVEMENT_LABEL: Record<MovementDirection, string> = {
  up: 'Moved up since the last assessment',
  down: 'Moved down since the last assessment',
  same: 'Unchanged since the last assessment',
  new: 'First assessment',
};

/**
 * Whether a level is worth drawing attention to.
 *
 * Returns a neutral emphasis flag, not a judgement: it drives ordering and
 * weight on a "who needs help" roster. It never produces a label, because the
 * label would be a ranking word.
 */
export function isEarlyLevel(level: FlnLevel): boolean {
  return level <= 2;
}

/**
 * A level distribution as ordered rows, every level present even at zero.
 *
 * Analytics keys all five levels deliberately: a chart that dropped the empty
 * ones would read as a narrower spread than the class actually has.
 */
export function levelDistributionRows(
  distribution: Record<string, number>,
): { level: FlnLevel; students: number }[] {
  return ([1, 2, 3, 4, 5] as const).map((level) => ({
    level,
    students: distribution[String(level)] ?? 0,
  }));
}
