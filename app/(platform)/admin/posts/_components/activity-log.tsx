import { CalendarClock, CheckCircle, EyeOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const activities = [
  {
    id: 'lg-01',
    admin: 'Admin User#1',
    action: 'Ẩn bài RP003 - Ảnh có dấu hiệu bạo lực',
    time: '16/01/2024 - 10:12',
    type: 'hidden' as const,
  },
  {
    id: 'lg-02',
    admin: 'Admin User#2',
    action: 'Khóa tài khoản đăng RP001 - Nội dung không phù hợp',
    time: '15/01/2024 - 18:40',
    type: 'banned' as const,
  },
  {
    id: 'lg-03',
    admin: 'Admin User#3',
    action: 'Gửi cảnh báo và yêu cầu chỉnh sửa cho RP002',
    time: '15/01/2024 - 15:05',
    type: 'warning' as const,
  },
  {
    id: 'lg-04',
    admin: 'Admin User#1',
    action: 'Đánh dấu RP005 là không vi phạm',
    time: '14/01/2024 - 09:32',
    type: 'resolved' as const,
  },
];

function ActivityIcon({ type }: { type: (typeof activities)[number]['type'] }) {
  if (type === 'hidden')
    return <EyeOff className="h-4 w-4 text-slate-500" aria-hidden />;
  if (type === 'banned')
    return <CalendarClock className="h-4 w-4 text-rose-500" aria-hidden />;
  if (type === 'warning')
    return <CalendarClock className="h-4 w-4 text-amber-500" aria-hidden />;
  return <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden />;
}

export function ActivityLog() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Log hoạt động quản trị</h3>
          <p className="text-sm text-slate-500">
            Theo dõi thao tác xử lý nội dung của đội ngũ admin
          </p>
        </div>
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Real-time</Badge>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-3">
            <div className="rounded-full bg-sky-50 p-2">
              <ActivityIcon type={item.type} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{item.admin}</span>{' '}
                {item.action}
              </div>
              <div className="text-xs text-slate-500">{item.time}</div>
            </div>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
              #{item.id}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
