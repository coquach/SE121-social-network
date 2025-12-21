'use client';

import { getAuditLogs, AuditLogQuery } from '@/lib/actions/admin/admin-log-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { AuditLogResponseDTO } from '@/models/log/logDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useAdminAuditLogs = (filter: AuditLogQuery) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<AuditLogResponseDTO>>({
    queryKey: ['admin-audit-logs', { ...filter, cursor: undefined }],
    initialPageParam: filter.cursor,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getAuditLogs(token, { ...filter, cursor: pageParam ?? filter.cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined),
    staleTime: 10_000,
    gcTime: 120_000,
  });
};
