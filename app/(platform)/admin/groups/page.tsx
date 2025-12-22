'use client';

import * as React from 'react';
import { Plus, ShieldQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GroupsTable } from './_components/groups-table';
import { GroupsToolbar } from './_components/groups-toolbar';
import { AdminGroupQuery } from '@/lib/actions/admin/admin-group-action';
import { useAdminGroups, useGroupModeration } from '@/hooks/use-admin-group';
import { AdminActivityLog } from '../_components/admin-activity-log';
import { LogType } from '@/models/log/logDTO';
import { GroupReportsDrawer } from './_components/group-reports-drawer';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';

export default function AdminGroupsPage() {
  const [filter, setFilter] = React.useState<AdminGroupQuery>({ limit: 8 });
  const [selectedGroup, setSelectedGroup] = React.useState<AdminGroupDTO | null>(null);

  const groupsQuery = useAdminGroups(filter);
  const groups = React.useMemo(
    () => groupsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [groupsQuery.data]
  );

  const { banMutation, unbanMutation, updateStatusLocally } = useGroupModeration();

  const handleFilterChange = (changes: Partial<AdminGroupQuery>) => {
    setFilter((prev) => ({ ...prev, ...changes }));
  };

  const handleReset = () => {
    setFilter({ limit: filter.limit });
  };

  const handleBan = (group: AdminGroupDTO) => {
    updateStatusLocally(group.groupId, GroupStatus.BANNED);
    banMutation.mutate(group.groupId);
  };

  const handleUnban = (group: AdminGroupDTO) => {
    updateStatusLocally(group.groupId, GroupStatus.ACTIVE);
    unbanMutation.mutate(group.groupId);
  };

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
        <GroupsToolbar filter={filter} onFilterChange={handleFilterChange} onReset={handleReset} loading={groupsQuery.isLoading} />
        <div className="mt-4">
          <GroupsTable
            groups={groups}
            loading={groupsQuery.isLoading || groupsQuery.isFetching}
            hasMore={groupsQuery.hasNextPage}
            onLoadMore={() => groupsQuery.fetchNextPage()}
            onViewReports={(group) => setSelectedGroup(group)}
            onBanGroup={handleBan}
            onUnbanGroup={handleUnban}
          />
        </div>
      </div>

      <AdminActivityLog
        title="Log hoạt động nhóm"
        description="Theo dõi thao tác quản trị liên quan đến nhóm"
        filter={{ logType: LogType.GROUP_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến nhóm"
      />

      <GroupReportsDrawer
        groupId={selectedGroup?.groupId}
        groupName={selectedGroup?.name}
        open={!!selectedGroup}
        onOpenChange={(open) => {
          if (!open) setSelectedGroup(null);
        }}
      />
    </div>
  );
}
