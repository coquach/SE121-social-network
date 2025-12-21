"use client";

import { format, parseISO, subDays } from 'date-fns';
import { Download, RefreshCcw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ActivityBars } from './_components/activity-bars';
import { DistributionCard } from './_components/distribution-card';
import { InsightsCard } from './_components/insights-card';
import { MetricsOverview } from './_components/metrics-overview';
import { TopGroupsCard } from './_components/top-groups';
import { TrendCard } from './_components/trend-card';

type CategoryKey = 'Bạo lực' | 'Spam' | 'Lừa đảo' | 'Ngôn từ thù ghét' | 'Khác';
type GroupKey =
  | 'Cộng đồng nhiếp ảnh'
  | 'Chợ đồ cũ Hà Nội'
  | 'Developer Việt Nam'
  | 'Tuyển dụng IT mỗi ngày'
  | 'Tối giản sống xanh';

type DailyAnalytics = {
  date: string;
  label: string;
  newReports: number;
  resolved: number;
  flagged: number;
  priority: number;
  activeUsers: number;
  newPosts: number;
  averageResponseMinutes: number;
  categories: Record<CategoryKey, number>;
  groups: Record<GroupKey, number>;
};

const analyticsData: DailyAnalytics[] = [
  {
    date: '2024-07-08',
    label: 'T2',
    newReports: 128,
    resolved: 102,
    flagged: 16,
    priority: 12,
    activeUsers: 8350,
    newPosts: 460,
    averageResponseMinutes: 78,
    categories: {
      'Bạo lực': 26,
      Spam: 24,
      'Lừa đảo': 18,
      'Ngôn từ thù ghét': 32,
      Khác: 28,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 15,
      'Chợ đồ cũ Hà Nội': 22,
      'Developer Việt Nam': 14,
      'Tuyển dụng IT mỗi ngày': 18,
      'Tối giản sống xanh': 10,
    },
  },
  {
    date: '2024-07-09',
    label: 'T3',
    newReports: 142,
    resolved: 118,
    flagged: 14,
    priority: 11,
    activeUsers: 8420,
    newPosts: 480,
    averageResponseMinutes: 74,
    categories: {
      'Bạo lực': 30,
      Spam: 26,
      'Lừa đảo': 22,
      'Ngôn từ thù ghét': 38,
      Khác: 26,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 16,
      'Chợ đồ cũ Hà Nội': 24,
      'Developer Việt Nam': 15,
      'Tuyển dụng IT mỗi ngày': 21,
      'Tối giản sống xanh': 12,
    },
  },
  {
    date: '2024-07-10',
    label: 'T4',
    newReports: 136,
    resolved: 111,
    flagged: 12,
    priority: 10,
    activeUsers: 8475,
    newPosts: 495,
    averageResponseMinutes: 72,
    categories: {
      'Bạo lực': 28,
      Spam: 24,
      'Lừa đảo': 21,
      'Ngôn từ thù ghét': 35,
      Khác: 28,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 15,
      'Chợ đồ cũ Hà Nội': 23,
      'Developer Việt Nam': 16,
      'Tuyển dụng IT mỗi ngày': 20,
      'Tối giản sống xanh': 11,
    },
  },
  {
    date: '2024-07-11',
    label: 'T5',
    newReports: 155,
    resolved: 129,
    flagged: 17,
    priority: 13,
    activeUsers: 8520,
    newPosts: 510,
    averageResponseMinutes: 70,
    categories: {
      'Bạo lực': 32,
      Spam: 28,
      'Lừa đảo': 24,
      'Ngôn từ thù ghét': 41,
      Khác: 30,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 18,
      'Chợ đồ cũ Hà Nội': 26,
      'Developer Việt Nam': 17,
      'Tuyển dụng IT mỗi ngày': 22,
      'Tối giản sống xanh': 12,
    },
  },
  {
    date: '2024-07-12',
    label: 'T6',
    newReports: 162,
    resolved: 134,
    flagged: 18,
    priority: 12,
    activeUsers: 8600,
    newPosts: 528,
    averageResponseMinutes: 69,
    categories: {
      'Bạo lực': 34,
      Spam: 30,
      'Lừa đảo': 26,
      'Ngôn từ thù ghét': 42,
      Khác: 30,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 17,
      'Chợ đồ cũ Hà Nội': 27,
      'Developer Việt Nam': 16,
      'Tuyển dụng IT mỗi ngày': 23,
      'Tối giản sống xanh': 13,
    },
  },
  {
    date: '2024-07-13',
    label: 'T7',
    newReports: 170,
    resolved: 139,
    flagged: 19,
    priority: 14,
    activeUsers: 8645,
    newPosts: 545,
    averageResponseMinutes: 71,
    categories: {
      'Bạo lực': 36,
      Spam: 32,
      'Lừa đảo': 28,
      'Ngôn từ thù ghét': 44,
      Khác: 30,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 18,
      'Chợ đồ cũ Hà Nội': 28,
      'Developer Việt Nam': 17,
      'Tuyển dụng IT mỗi ngày': 24,
      'Tối giản sống xanh': 13,
    },
  },
  {
    date: '2024-07-14',
    label: 'CN',
    newReports: 158,
    resolved: 128,
    flagged: 16,
    priority: 13,
    activeUsers: 8580,
    newPosts: 520,
    averageResponseMinutes: 73,
    categories: {
      'Bạo lực': 32,
      Spam: 30,
      'Lừa đảo': 24,
      'Ngôn từ thù ghét': 40,
      Khác: 32,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 16,
      'Chợ đồ cũ Hà Nội': 25,
      'Developer Việt Nam': 15,
      'Tuyển dụng IT mỗi ngày': 21,
      'Tối giản sống xanh': 12,
    },
  },
  {
    date: '2024-07-15',
    label: 'T2',
    newReports: 149,
    resolved: 123,
    flagged: 15,
    priority: 12,
    activeUsers: 8490,
    newPosts: 505,
    averageResponseMinutes: 75,
    categories: {
      'Bạo lực': 30,
      Spam: 28,
      'Lừa đảo': 22,
      'Ngôn từ thù ghét': 39,
      Khác: 30,
    },
    groups: {
      'Cộng đồng nhiếp ảnh': 16,
      'Chợ đồ cũ Hà Nội': 24,
      'Developer Việt Nam': 15,
      'Tuyển dụng IT mỗi ngày': 21,
      'Tối giản sống xanh': 11,
    },
  },
];

const categoryMeta: Record< CategoryKey, { color: string; gradientClass: string } > = {
  'Bạo lực': { color: '#f43f5e', gradientClass: 'from-rose-500 to-rose-400' },
  Spam: { color: '#fb923c', gradientClass: 'from-amber-400 to-orange-400' },
  'Lừa đảo': { color: '#a855f7', gradientClass: 'from-purple-500 to-indigo-500' },
  'Ngôn từ thù ghét': { color: '#0ea5e9', gradientClass: 'from-sky-500 to-cyan-500' },
  Khác: { color: '#10b981', gradientClass: 'from-emerald-500 to-green-500' },
};

const groupMeta: Record<
  GroupKey,
  { trend: string; status: 'ổn định' | 'cần theo dõi'; color: string }
> = {
  'Cộng đồng nhiếp ảnh': { trend: '+12% lưu lượng', status: 'ổn định', color: 'bg-sky-400' },
  'Chợ đồ cũ Hà Nội': { trend: 'Tăng báo cáo spam', status: 'cần theo dõi', color: 'bg-amber-400' },
  'Developer Việt Nam': { trend: 'Hoạt động cao', status: 'ổn định', color: 'bg-emerald-400' },
  'Tuyển dụng IT mỗi ngày': { trend: 'Đang kiểm duyệt', status: 'cần theo dõi', color: 'bg-rose-400' },
  'Tối giản sống xanh': { trend: 'Tương tác đều', status: 'ổn định', color: 'bg-purple-400' },
};

const formatInputDate = (date: Date) => format(date, 'yyyy-MM-dd');

export default function AdminAnalyticsPage() {
  const defaultEnd = React.useMemo(() => new Date(), []);
  const defaultStart = React.useMemo(() => subDays(defaultEnd, 6), [defaultEnd]);
  const [startDate, setStartDate] = React.useState(formatInputDate(defaultStart));
  const [endDate, setEndDate] = React.useState(formatInputDate(defaultEnd));

  const filteredData = React.useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return analyticsData.filter((item) => {
      const current = parseISO(item.date);
      return current >= start && current <= end;
    });
  }, [startDate, endDate]);

  const totals = React.useMemo(() => {
    const initial = {
      totalReports: 0,
      resolved: 0,
      flagged: 0,
      priority: 0,
      activeUsers: 0,
      newPosts: 0,
      weightedResponseMinutes: 0,
    };

    const aggregated = filteredData.reduce((acc, item) => {
      acc.totalReports += item.newReports;
      acc.resolved += item.resolved;
      acc.flagged += item.flagged;
      acc.priority += item.priority;
      acc.activeUsers += item.activeUsers;
      acc.newPosts += item.newPosts;
      acc.weightedResponseMinutes += item.averageResponseMinutes * item.newReports;
      return acc;
    }, initial);

    const averageResponseMinutes = aggregated.totalReports
      ? Math.round(aggregated.weightedResponseMinutes / aggregated.totalReports)
      : 0;

    return { ...aggregated, averageResponseMinutes };
  }, [filteredData]);

  const distribution = React.useMemo(() => {
    return (Object.keys(categoryMeta) as CategoryKey[]).map((key) => ({
      label: key,
      value: filteredData.reduce((sum, item) => sum + (item.categories[key] ?? 0), 0),
      color: categoryMeta[key].color,
      gradientClass: categoryMeta[key].gradientClass,
    }));
  }, [filteredData]);

  const topGroups = React.useMemo(() => {
    return (Object.keys(groupMeta) as GroupKey[]).map((key) => ({
      name: key,
      reports: filteredData.reduce((sum, item) => sum + (item.groups[key] ?? 0), 0),
      trend: groupMeta[key].trend,
      status: groupMeta[key].status,
      color: groupMeta[key].color,
    }));
  }, [filteredData]);

  const trendData = React.useMemo(
    () =>
      filteredData.map((item) => ({
        label: format(parseISO(item.date), 'dd/MM'),
        value: item.newReports,
      })),
    [filteredData],
  );

  const handleQuickWeek = () => {
    setStartDate(formatInputDate(subDays(new Date(), 6)));
    setEndDate(formatInputDate(new Date()));
  };

  const dateRangeLabel = `${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Báo cáo & Phân tích</h1>
          <p className="text-sm text-slate-500">
            Quan sát xu hướng báo cáo, hiệu suất xử lý và phân bổ nguồn lực kiểm duyệt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-white p-2 shadow-sm">
            <div className="flex flex-col text-xs text-slate-600">
              <span className="font-medium">Từ ngày</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-40 border-sky-100 text-sm focus-visible:ring-sky-200"
              />
            </div>
            <div className="flex flex-col text-xs text-slate-600">
              <span className="font-medium">Đến ngày</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-40 border-sky-100 text-sm focus-visible:ring-sky-200"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
              onClick={handleQuickWeek}
            >
              <RefreshCcw className="mr-1.5 h-4 w-4" /> Tuần này
            </Button>
          </div>

          <Button className="bg-sky-600 text-white hover:bg-sky-700">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <MetricsOverview
        metrics={[
          {
            label: 'Tổng báo cáo',
            value: totals.totalReports.toLocaleString('vi-VN'),
            detail: `Trong khoảng ${dateRangeLabel}`,
            icon: 'shield',
          },
          {
            label: 'Báo cáo ưu tiên',
            value: totals.priority.toLocaleString('vi-VN'),
            detail: 'Cần xử lý trong 24h',
            icon: 'bell',
          },
          {
            label: 'Người dùng hoạt động',
            value: totals.activeUsers.toLocaleString('vi-VN'),
            detail: 'Tổng hoạt động trong phạm vi thời gian',
            icon: 'users',
          },
          {
            label: 'Bài viết mới',
            value: totals.newPosts.toLocaleString('vi-VN'),
            detail: `${Math.max(0, totals.newPosts - 480).toLocaleString('vi-VN')} bài so với mốc trước`,
            icon: 'activity',
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <TrendCard data={trendData} />
        <InsightsCard
          successRate={totals.totalReports ? Math.round((totals.resolved / totals.totalReports) * 100) : 0}
          priorityCount={totals.priority}
          avgResponseMinutes={totals.averageResponseMinutes}
          flagged={totals.flagged}
        />
      </div>

      <ActivityBars
        data={filteredData.map((day) => ({
          label: day.label,
          resolved: day.resolved,
          flagged: day.flagged,
          newReports: day.newReports,
        }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionCard data={distribution} />
        <TopGroupsCard data={topGroups} />
      </div>
    </div>
  );
}
