"use client";

import * as React from "react";

import { useSystemUsers } from "@/hooks/use-admin-users";
import { SystemUserFilter } from "@/lib/actions/admin/admin-users-action";
import { LogType } from "@/models/log/logDTO";
import { AdminActivityLog } from "../_components/admin-activity-log";
import { UsersTable } from "./_components/table";
import { UsersToolbar } from "./_components/toolbar";
import { CreateUserDialog } from "./_components/create-user-dialog";

export default function AdminUsersPage() {
  const [filter, setFilter] = React.useState<SystemUserFilter>({ page: 1, limit: 10 });
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data, isLoading, isFetching } = useSystemUsers(filter);

  const handleFilterChange = (changes: Partial<SystemUserFilter>) => {
    setFilter((prev) => ({ ...prev, ...changes }));
  };

  const handleReset = () => {
    setFilter({ page: 1, limit: filter.limit ?? 10 });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500">
            Theo dõi tài khoản, trạng thái hoạt động và thông tin hồ sơ
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <UsersToolbar
          filter={filter}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onCreateUser={() => setCreateOpen(true)}
        />
        <div className="mt-4">
          <UsersTable
            users={data?.data ?? []}
            page={data?.page ?? filter.page ?? 1}
            pageSize={data?.limit ?? filter.limit ?? 10}
            total={data?.total ?? 0}
            loading={isLoading || isFetching}
            onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AdminActivityLog
        title="Log hoạt động người dùng"
        description="Theo dõi thao tác quản trị liên quan đến tài khoản"
        filter={{ logType: LogType.USER_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến người dùng"
      />
    </div>
  );
}
