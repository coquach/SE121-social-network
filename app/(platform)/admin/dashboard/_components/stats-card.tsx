import { Users, FileText, Smile, Flag } from 'lucide-react';

export const dashboardStatsMock = [
  { label: 'Tổng số người dùng', value: '12.430', icon: Users },
  { label: 'Bài viết trong ngày', value: '1.284', icon: FileText },
  { label: 'Tỷ lệ cảm xúc tích cực', value: '68%', icon: Smile },
  { label: 'Nội dung chờ xử lý', value: '23', icon: Flag },
] as const;


export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {dashboardStatsMock.map((item) => (
        <div
          key={item.label}
          className="
            rounded-xl border border-sky-100 bg-white p-4 shadow-sm
            hover:shadow-md transition
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="text-2xl font-semibold text-slate-800">
                {item.value}
              </p>
            </div>

            <div className="rounded-lg bg-sky-100 p-2">
              <item.icon className="h-5 w-5 text-sky-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
