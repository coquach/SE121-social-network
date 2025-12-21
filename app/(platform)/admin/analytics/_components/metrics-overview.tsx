import { ActivitySquare, BarChart3, ShieldCheck, Users } from 'lucide-react';

const metrics = [
  {
    label: 'Tổng báo cáo',
    value: '12.345',
    detail: '+8% so với tuần trước',
    icon: ShieldCheck,
    accent: 'from-purple-500/15 to-sky-500/10',
  },
  {
    label: 'Người dùng hoạt động',
    value: '8.001',
    detail: '72% quay lại hằng ngày',
    icon: Users,
    accent: 'from-sky-500/15 to-emerald-500/10',
  },
  {
    label: 'Bài viết mới',
    value: '45.678',
    detail: '+1.204 bài trong 24h',
    icon: ActivitySquare,
    accent: 'from-orange-500/15 to-amber-500/10',
  },
  {
    label: 'Cảnh báo mở',
    value: '234',
    detail: '18 báo cáo ưu tiên cao',
    icon: BarChart3,
    accent: 'from-rose-500/15 to-purple-500/10',
  },
];

export function MetricsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <div
          key={item.label}
          className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
        >
          <div className="bg-linear-to-r px-4 py-3 text-sm text-slate-700 font-medium from-sky-50 to-white">
            {item.label}
          </div>

          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <div>
              <div className="text-2xl font-semibold text-slate-800">{item.value}</div>
              <p className="text-sm text-slate-500">{item.detail}</p>
            </div>

            <div
              className={`rounded-xl bg-linear-to-br ${item.accent} p-3 text-sky-600 shadow-inner`}
            >
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
