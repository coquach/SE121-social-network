import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { ActivityBars } from './_components/activity-bars';
import { DistributionCard } from './_components/distribution-card';
import { InsightsCard } from './_components/insights-card';
import { MetricsOverview } from './_components/metrics-overview';
import { TopGroupsCard } from './_components/top-groups';
import { TrendCard } from './_components/trend-card';

export default function AdminAnalyticsPage() {
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
          <Button variant="outline" className="border-sky-200 text-slate-700 hover:bg-sky-50">
            Lọc nhanh tuần này
          </Button>
          <Button className="bg-sky-600 text-white hover:bg-sky-700">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <MetricsOverview />

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <TrendCard />
        <InsightsCard />
      </div>

      <ActivityBars />

      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionCard />
        <TopGroupsCard />
      </div>
    </div>
  );
}
