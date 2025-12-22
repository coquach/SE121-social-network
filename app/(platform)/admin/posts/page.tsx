'use client';

import * as React from 'react';

import { ContentToolbar } from './_components/content-toolbar';
import { ContentTable } from './_components/content-table';
import { useContentEntries } from '@/hooks/use-content-entries';
import { ContentEntryFilter } from '@/lib/actions/admin/content-entry-action';
import { AdminActivityLog } from '../_components/admin-activity-log';
import { LogType } from '@/models/log/logDTO';

export default function AdminPostsPage() {
  const [filter, setFilter] = React.useState<ContentEntryFilter>({ page: 1, limit: 10 });

  const { data, isLoading, isFetching } = useContentEntries(filter);

  const handleFilterChange = (changes: Partial<ContentEntryFilter>) => {
    setFilter((prev) => ({ ...prev, ...changes }));
  };

  const handleReset = () => {
    setFilter({ page: 1, limit: filter.limit ?? 10 });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý nội dung</h1>
          <p className="text-sm text-slate-500">
            Theo dõi báo cáo bài viết, mức độ nghiêm trọng và log xử lý
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <ContentToolbar filter={filter} onFilterChange={handleFilterChange} onReset={handleReset} />
        <div className="mt-4">
          <ContentTable
            entries={data?.data ?? []}
            page={filter.page ?? 1}
            pageSize={filter.limit ?? 10}
            total={data?.total ?? 0}
            loading={isLoading || isFetching}
            onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      <AdminActivityLog
        title="Log hoạt động bài viết"
        description="Theo dõi thao tác quản trị liên quan đến nội dung bài viết"
        filter={{ logType: LogType.POST_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến bài viết"
      />
    </div>
  );
}
