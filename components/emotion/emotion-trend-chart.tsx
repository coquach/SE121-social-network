import { format } from 'date-fns';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { feelingsUI } from '@/lib/types/feeling';
import { cn } from '@/lib/utils';

export type EmotionTrendPoint = {
  date: string | Date;
} & Record<string, number | string | Date>;

const chartConfig: ChartConfig = feelingsUI.reduce((acc, feeling, idx) => {
  const fallback = `hsl(var(--chart-${(idx % 6) + 1}))`;
  const key = feeling.type.toLowerCase();
  acc[key] = {
    label: `${feeling.emoji} ${feeling.name}`,
    color: fallback,
  };
  return acc;
}, {} as ChartConfig);

export function EmotionTrendChart({
  data,
  loading,
  emptyText = 'Chưa có dữ liệu cảm xúc trong khoảng thời gian này.',
  className,
  legendPosition = 'bottom',
}: {
  data?: EmotionTrendPoint[];
  loading: boolean;
  emptyText?: string;
  className?: string;
  legendPosition?: 'top' | 'bottom';
}) {
  const chartData =
    data?.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), 'dd/MM'),
    })) ?? [];

  const emotionKeys = Object.keys(chartConfig) as (keyof typeof chartConfig)[];
  const hasData = chartData.some((row) =>
    emotionKeys.some(
      (k) => k in row && Number((row as Record<string, any>)[k]) > 0
    )
  );

  if (loading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (!hasData || !data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        'w-full',
        legendPosition === 'bottom' && '[&_.recharts-legend-wrapper]:!bottom-0',
        className
      )}
    >
      <AreaChart data={chartData} margin={{ left: -12, right: 12, top: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
        <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend verticalAlign={legendPosition} content={<ChartLegendContent />} />
        {emotionKeys.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={String(chartConfig[key].label)}
            stroke={`var(--color-${key})`}
            fill={`color-mix(in srgb, var(--color-${key}) 18%, transparent)`}
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
