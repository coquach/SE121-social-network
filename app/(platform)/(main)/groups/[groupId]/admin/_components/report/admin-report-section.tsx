'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGetGroupReports } from '@/hooks/use-groups';
import { CursorPagination } from '@/lib/cursor-pagination.dto';
import { GroupReportDTO } from '@/models/group/groupReportDTO';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';

import { Skeleton } from '@/components/ui/skeleton';
import ReportRow from './report-row';

type Props = {
  groupId: string;
};

const DEFAULT_PAGINATION: CursorPagination = {
  limit: 20,
};

export const GroupAdminReportsSection = ({ groupId }: Props) => {
  const { can } = useGroupPermissionContext();
  const canViewReports = can(GroupPermission.VIEW_REPORTS);


  const {
    data,
    status,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetGroupReports(groupId, DEFAULT_PAGINATION);

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allReports: GroupReportDTO[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  if (!canViewReports) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-4 py-3 rounded-xl text-sm text-amber-800">
        Bạn không có quyền xem báo cáo của nhóm này.
      </div>
    );
  }

  if (isLoading || status === 'pending') {
    return <ReportsSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Không thể tải danh sách báo cáo.
        {error instanceof Error && (
          <>
            <br />
            {error.message}
          </>
        )}
      </div>
    );
  }

  const total = allReports.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-sky-700">Báo cáo nhóm</h2>
          <p className="text-xs text-sky-600/90">
            Có <b>{total}</b> báo cáo được gửi lên cho nhóm này.
          </p>
        </div>
      </div>

      {/* Danh sách báo cáo */}

      <div className="rounded-xl border border-sky-100 bg-white/90">
        {!isLoading && allReports.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
              <span className="text-lg">📝</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Chưa có báo cáo nào được gửi cho nhóm này.
            </p>
            <p className="text-xs text-slate-500">
              Khi có báo cáo mới, chúng sẽ hiển thị ở đây.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="divide-y divide-slate-100 px-4 py-3">
            {allReports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>

      {/* sentinel infinite scroll */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-xs text-sky-600/80">
            Đang tải thêm báo cáo...
          </span>
        )}
        {!hasNextPage && total > 0 && (
          <span className="text-xs text-slate-400">
            Đã hiển thị tất cả báo cáo.
          </span>
        )}
      </div>
    </div>
  );
};

const ReportsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-3 border-slate-100 bg-slate-50/70 px-3 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1 w-full">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
};

