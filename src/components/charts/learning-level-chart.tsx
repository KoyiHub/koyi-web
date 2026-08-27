import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { BandBreakdown } from '@/features/school-admin/dashboard/api/dashboard.schema';

/**
 * The three FLN bands, in the order the design reference stacks them. Fills
 * are the soft band tokens; the legend markers use the solid ones.
 */
const BANDS = [
  { key: 'strong', label: 'Strong', fill: 'var(--color-koyi-band-strong-soft)' },
  { key: 'intermediate', label: 'Intermediate', fill: 'var(--color-koyi-band-intermediate-soft)' },
  { key: 'struggling', label: 'Struggling', fill: 'var(--color-koyi-band-struggling-soft)' },
] as const;

const AXIS_STYLE = { fontSize: 12, fill: 'var(--color-koyi-muted)' } as const;

interface LearningLevelChartProps {
  data: BandBreakdown[];
}

/**
 * Grouped bar chart of how many students sit in each FLN band, per grade or
 * per subject. The counts are computed server-side — this only draws them.
 *
 * A screen-reader summary accompanies the canvas, because an SVG chart on its
 * own conveys nothing to assistive technology.
 */
export function LearningLevelChart({ data }: LearningLevelChartProps) {
  return (
    <div>
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barCategoryGap="28%" margin={{ top: 8, right: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-koyi-border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_STYLE} dy={8} />
            <YAxis tickLine={false} axisLine={false} tick={AXIS_STYLE} width={36} />
            <Tooltip
              cursor={{ fill: 'var(--color-koyi-nav-active)', opacity: 0.5 }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-koyi-border)',
                fontSize: 12,
              }}
            />
            {BANDS.map((band) => (
              <Bar
                key={band.key}
                dataKey={band.key}
                name={band.label}
                fill={band.fill}
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="sr-only">
        {data.map((entry) => (
          <li key={entry.label}>
            {entry.label}: {entry.strong} strong, {entry.intermediate} intermediate,{' '}
            {entry.struggling} struggling.
          </li>
        ))}
      </ul>

      <div className="border-koyi-border mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-dashed pt-4">
        {BANDS.map((band) => (
          <span
            key={band.key}
            className="text-koyi-muted flex items-center gap-2 text-xs font-medium"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: `var(--color-koyi-band-${band.key})`,
                // Soft halo in the same hue: the design's outlined legend dot.
                boxShadow: `0 0 0 4px ${band.fill}`,
              }}
            />
            {band.label}
          </span>
        ))}
      </div>
    </div>
  );
}
