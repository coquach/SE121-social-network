import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ActivityLog } from './_components/activity-log';
import { ReportsTable } from './_components/reports-table';
import { ReportsToolbar } from './_components/reports-toolbar';

export default function AdminPostsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý nội dung</h1>
          <p className="text-sm text-slate-500">
            Theo dõi báo cáo bài viết, mức độ nghiêm trọng và log xử lý
          </p>
        </div>

        <Button className="bg-sky-600 text-white hover:bg-sky-700">
          <FileText className="mr-2 h-4 w-4" />
          Xuất log hoạt động
        </Button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <ReportsToolbar />
        <div className="mt-4">
          <ReportsTable />
        </div>
      </div>

      <ActivityLog />
    </div>
  );
}
