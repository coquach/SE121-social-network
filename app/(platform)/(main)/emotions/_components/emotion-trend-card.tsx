import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmotionDailyTrendDTO } from '@/models/emotion/emotionDTO';
import { format } from 'date-fns';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { EMOTION_KEYS, emotionMeta } from './emotion-meta';

interface EmotionTrendCardProps {
  data?: EmotionDailyTrendDTO[];
  loading: boolean;
}

const chartConfig = EMOTION_KEYS.reduce(
  (acc, key) => {
    acc[key] = {
      label: `${emotionMeta[key].emoji} ${emotionMeta[key].label}`,
      color: emotionMeta[key].color,
    };
    return acc;
  },
  {} as Record<string, { label: string; color: string }>
);

export const EmotionTrendCard = ({ data, loading }: EmotionTrendCardProps) => {
  const chartData =
    data?.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), 'dd/MM'),
    })) ?? [];

  const hasData = chartData.length > 0;

  return (
    <Card className="h-full border-slate-100 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-sky-500">
          Xu hướng theo ngày
        </CardTitle>
        <p className="text-sm text-slate-500">
          Theo dõi biến động cảm xúc trong khoảng thời gian đã chọn.
        </p>
      </CardHeader>
      <CardContent className="mt-2">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : hasData ? (
          <ChartContainer
            config={chartConfig}
            className="h-80 w-full [&_.recharts-legend-wrapper]:bottom-0!"
          >
            <AreaChart data={chartData} margin={{ left: -10, right: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
              {EMOTION_KEYS.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={chartConfig[key].label}
                  stroke={`var(--color-${key})`}
                  fill={`color-mix(in srgb, var(--color-${key}) 15%, transparent)`}
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
            Chưa có đủ dữ liệu để vẽ biểu đồ.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
