'use client';

import { useMemo } from 'react';

import { AuditLogList } from '@/components/admin/audit-log-list';
import { useAdminAuditLogs } from '@/hooks/use-admin-logs';
import { LogType } from '@/models/log/logDTO';

const DEFAULT_LIMIT = 5;

export function UserActivityLog() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminAuditLogs({
    limit: DEFAULT_LIMIT,
    logType: LogType.USER_LOG,
  });

  const logs = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <AuditLogList
      title="Log hoạt động người dùng"
      description="Theo dõi thao tác quản trị liên quan đến tài khoản"
      logs={logs}
      loading={isLoading}
      hasMore={hasNextPage}
      isFetchingMore={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
    />
  );
}
