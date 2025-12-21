import { Plus, ShieldQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GroupsTable } from './_components/groups-table';
import { GroupsToolbar } from './_components/groups-toolbar';

export default function AdminGroupsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý nhóm</h1>
          <p className="text-sm text-slate-500">
            Theo dõi sức khỏe cộng đồng, báo cáo vi phạm và trạng thái duyệt nhóm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="border-sky-200 text-slate-700 hover:bg-sky-50">
            <ShieldQuestion className="mr-2 h-4 w-4" />
            Nhóm cần kiểm duyệt
          </Button>
          <Button className="bg-sky-600 text-white hover:bg-sky-700">
            <Plus className="mr-2 h-4 w-4" />
            Tạo nhóm mới
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <GroupsToolbar />
        <div className="mt-4">
          <GroupsTable />
        </div>
      </div>
    </div>
  );
}
