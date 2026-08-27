import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendPoint } from '@/features/school-admin/dashboard/api/dashboard.schema';

const AXIS_STYLE = { fontSize: 12, fill: 'var(--color-koyi-muted)' } as const;

interface ProgressTrendChartProps {
  data: TrendPoint[];
}

/**
 * School-wide average score over the last six months — a smooth line with a
 * soft violet wash beneath it, per the design reference. Values come from the
 * server; nothing is derived here.
 */
export function ProgressTrendChart({ data }: ProgressTrendChartProps) {
  return (
    <div>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8 }}>
            <defs>
              <linearGradient id="koyi-progress-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-koyi-accent)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-koyi-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="var(--color-koyi-border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_STYLE} dy={8} />
            <YAxis tickLine={false} axisLine={false} tick={AXIS_STYLE} width={36} />
            <Tooltip
              cursor={{ stroke: 'var(--color-koyi-border)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-koyi-border)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Average score"
              stroke="var(--color-koyi-primary)"
              strokeWidth={3}
              fill="url(#koyi-progress-fill)"
              dot={{ r: 4, fill: '#ffffff', stroke: 'var(--color-koyi-primary)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ul className="sr-only">
        {data.map((point) => (
          <li key={point.label}>
            {point.label}: {point.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}
