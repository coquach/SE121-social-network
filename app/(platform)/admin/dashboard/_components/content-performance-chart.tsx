'use client';

import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type ContentChartItem = {
  date: string;
  postCount: number;
  commentCount: number;
  shareCount: number;
};

const chartConfig = {
  posts: { label: 'Bài viết', color: 'hsl(var(--chart-1))' },
  comments: { label: 'Bình luận', color: 'hsl(var(--chart-2))' },
  shares: { label: 'Chia sẻ', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

export function ContentPerformanceChart({ data, loading }: { data?: ContentChartItem[]; loading: boolean }) {
  const chartData =
    data?.map((item) => ({
      date: format(new Date(item.date), 'dd/MM'),
      posts: item.postCount,
      comments: item.commentCount,
      shares: item.shareCount,
    })) ?? [];

  const hasData = chartData.some((d) => d.posts || d.comments || d.shares);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
        Không có dữ liệu nội dung trong khoảng thời gian này.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <LineChart data={chartData} margin={{ left: -12, right: 12, top: 8 }}>
        <CartesianGrid strokeDasharray="4 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="posts" stroke="var(--color-posts)" strokeWidth={2.4} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="comments" stroke="var(--color-comments)" strokeWidth={2.4} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="shares" stroke="var(--color-shares)" strokeWidth={2.4} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  );
}
