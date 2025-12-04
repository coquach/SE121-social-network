'use client';

import { useEffect, useMemo, useState } from 'react';
import { InView, useInView } from 'react-intersection-observer';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useGetGroupLogs } from '@/hooks/use-groups';

import { GroupRole } from '@/models/group/enums/group-role.enum';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupEventLog } from '@/models/group/enums/group-envent-log.enum';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { LogRow } from './log-row';

// ===== helper map label & màu cho event =====
export const EVENT_LABEL: Record<string, string> = {
  [GroupEventLog.GROUP_UPDATED]: 'Cập nhật thông tin nhóm',
  [GroupEventLog.GROUP_SETTING_CHANGED]: 'Thay đổi cài đặt nhóm',

  [GroupEventLog.JOIN_REQUEST_APPROVED]: 'Đã chấp nhận yêu cầu tham gia',
  [GroupEventLog.JOIN_REQUEST_REJECTED]: 'Đã từ chối yêu cầu tham gia',

  [GroupEventLog.MEMBER_JOINED]: 'Thành viên mới tham gia',
  [GroupEventLog.MEMBER_LEFT]: 'Thành viên rời nhóm',
  [GroupEventLog.MEMBER_REMOVED]: 'Đã xoá thành viên',
  [GroupEventLog.MEMBER_BANNED]: 'Đã chặn thành viên',
  [GroupEventLog.MEMBER_UNBANNED]: 'Đã gỡ chặn thành viên',

  [GroupEventLog.POST_APPROVED]: 'Đã duyệt bài viết',
  [GroupEventLog.POST_REJECTED]: 'Đã từ chối bài viết',

  [GroupEventLog.MEMBER_ROLE_CHANGED]: 'Thay đổi vai trò thành viên',
  [GroupEventLog.MEMBER_PERMISSION_CHANGED]: 'Thay đổi quyền thành viên',
};

export const EVENT_BADGE_COLOR: Record<string, string> = {
  [GroupEventLog.GROUP_UPDATED]: 'bg-sky-50 text-sky-700 border-sky-200',
  [GroupEventLog.GROUP_SETTING_CHANGED]:
    'bg-sky-50 text-sky-700 border-sky-200',

  [GroupEventLog.JOIN_REQUEST_APPROVED]:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  [GroupEventLog.JOIN_REQUEST_REJECTED]:
    'bg-rose-50 text-rose-700 border-rose-200',

  [GroupEventLog.MEMBER_JOINED]:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  [GroupEventLog.MEMBER_LEFT]: 'bg-slate-50 text-slate-600 border-slate-200',
  [GroupEventLog.MEMBER_REMOVED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [GroupEventLog.MEMBER_BANNED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [GroupEventLog.MEMBER_UNBANNED]:
    'bg-amber-50 text-amber-700 border-amber-200',

  [GroupEventLog.POST_APPROVED]: 'bg-sky-50 text-sky-700 border-sky-200',
  [GroupEventLog.POST_REJECTED]: 'bg-rose-50 text-rose-700 border-rose-200',

  [GroupEventLog.MEMBER_ROLE_CHANGED]:
    'bg-indigo-50 text-indigo-700 border-indigo-200',
  [GroupEventLog.MEMBER_PERMISSION_CHANGED]:
    'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const EVENT_CATEGORY: {
  label: string;
  value: 'ALL' | GroupEventLog;
}[] = [
  { label: 'Tất cả hoạt động', value: 'ALL' },
  { label: 'Cập nhật nhóm', value: GroupEventLog.GROUP_UPDATED },
  {
    label: 'Thay đổi cài đặt',
    value: GroupEventLog.GROUP_SETTING_CHANGED,
  },
  { label: 'Yêu cầu tham gia', value: GroupEventLog.JOIN_REQUEST_APPROVED },
  { label: 'Thành viên', value: GroupEventLog.MEMBER_JOINED },
  { label: 'Bài viết', value: GroupEventLog.POST_APPROVED },
  { label: 'Role & quyền', value: GroupEventLog.MEMBER_ROLE_CHANGED },
];

type Props = {
  groupId: string;
};

export const GroupAdminLogsSection = ({ groupId }: Props) => {
  const { role, can } = useGroupPermissionContext();
  const [eventFilter, setEventFilter] = useState<'ALL' | GroupEventLog>('ALL');

  const isAdminLike =
    role === GroupRole.OWNER ||
    role === GroupRole.ADMIN ||
    role === GroupRole.MODERATOR;

  const canViewLogs =
    !!groupId && (isAdminLike || can(GroupPermission.VIEW_REPORTS));

  // tránh call API nếu không có quyền
  const effectiveGroupId = canViewLogs ? groupId : '';

  const filter = useMemo(
    () => ({
      cursor: undefined,
      eventType: eventFilter === 'ALL' ? undefined : eventFilter,
    }),
    [eventFilter]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetGroupLogs(effectiveGroupId, filter);

  const logs = data?.pages.flatMap((p) => p.data) ?? [];

  
    const { ref, inView } = useInView({ threshold: 0 });
  // 👇 auto fetch khi sentinel vào view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!canViewLogs) {
    return (
      <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 px-4 py-5 text-sm text-sky-800">
        Bạn không có quyền xem nhật ký hoạt động của nhóm này.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        Không thể tải nhật ký hoạt động. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 shadow-sm rounded-xl px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-sky-700">Nhật ký hoạt động</h2>
          <p className="text-xs text-sky-600/90">
            Theo dõi các hoạt động quan trọng diễn ra trong nhóm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-700 font-medium">Trạng thái:</span>
          <Select
            value={eventFilter}
            onValueChange={(v) => setEventFilter(v as 'ALL' | GroupEventLog)}
          >
            <SelectTrigger className="h-9 w-48 border-sky-400 text-sm focus:ring-sky-500 focus:ring-1">
              <SelectValue placeholder="Lọc theo loại hoạt động" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORY.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-sky-100 bg-white/90">
        {isLoading && (
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
              <span className="text-lg">📭</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Chưa có hoạt động nào trong nhật ký
            </p>
            <p className="text-xs text-slate-500">
              Các thao tác quản trị (duyệt bài, phê duyệt yêu cầu, thay đổi cài
              đặt...) sẽ được hiển thị tại đây.
            </p>
          </div>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="divide-y divide-slate-100 px-4 py-3">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
      {/* 👇 Sentinel để auto load thêm */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-xs text-sky-600/80">
            Đang tải thêm yêu cầu...
          </span>
        )}
        {!hasNextPage && (
          <span className="text-xs text-slate-400">
            Đã hiển thị tất cả yêu cầu.
          </span>
        )}
      </div>
    </div>
  );
};