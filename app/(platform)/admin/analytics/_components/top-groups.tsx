import { ArrowUpRight, ShieldCheck, ShieldOff } from 'lucide-react';

const topGroups = [
  {
    name: 'Cộng đồng nhiếp ảnh',
    reports: 58,
    trend: '+12% lưu lượng',
    status: 'ổn định',
    color: 'bg-sky-400',
  },
  {
    name: 'Chợ đồ cũ Hà Nội',
    reports: 72,
    trend: 'Tăng báo cáo spam',
    status: 'cần theo dõi',
    color: 'bg-amber-400',
  },
  {
    name: 'Developer Việt Nam',
    reports: 41,
    trend: 'Hoạt động cao',
    status: 'ổn định',
    color: 'bg-emerald-400',
  },
  {
    name: 'Tuyển dụng IT mỗi ngày',
    reports: 65,
    trend: 'Đang kiểm duyệt',
    status: 'cần theo dõi',
    color: 'bg-rose-400',
  },
  {
    name: 'Tối giản sống xanh',
    reports: 28,
    trend: 'Tương tác đều',
    status: 'ổn định',
    color: 'bg-purple-400',
  },
];

export function TopGroupsCard() {
  const maxValue = Math.max(...topGroups.map((g) => g.reports));

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Nhóm hoạt động nhiều</h2>
          <p className="text-sm text-slate-500">Theo dõi nhóm có lượt báo cáo cao để ưu tiên kiểm duyệt</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-3">
        {topGroups.map((group) => {
          const width = (group.reports / maxValue) * 100;
          const badge = group.status === 'ổn định' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              {group.status}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              <ShieldOff className="h-3 w-3" />
              {group.status}
            </span>
          );

          return (
            <div key={group.name} className="space-y-2 rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <div className="font-medium text-slate-800">{group.name}</div>
                {badge}
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${group.color}`}
                  style={{ width: `${width}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{group.reports} báo cáo</span>
                <span className="text-slate-600">{group.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
