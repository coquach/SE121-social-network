'use client';

import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AdminGroupQuery,
  banGroup,
  getAdminGroups,
  getGroupReports,
  GroupReportQuery,
  unbanGroup,
} from '@/lib/actions/admin/admin-group-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupReportDTO } from '@/models/group/groupReportDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';

export const useAdminGroups = (filter: AdminGroupQuery) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<AdminGroupDTO>>({
    queryKey: ['admin-groups', filter],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getAdminGroups(token, {
        ...filter,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useGroupReports = (
  groupId?: string,
  query: Omit<GroupReportQuery, 'groupId'> = {}
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupReportDTO>>({
    queryKey: ['group-reports', groupId, query],
    enabled: Boolean(groupId),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');

      return getGroupReports(token, {
        ...query,
        groupId,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useGroupModeration = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidateGroups = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-groups'] });

  const banMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return banGroup(token, groupId);
    },
    onSuccess: () => {
      toast.success('Đã hạn chế nhóm thành công');
      invalidateGroups();
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể hạn chế nhóm');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return unbanGroup(token, groupId);
    },
    onSuccess: () => {
      toast.success('Đã bỏ hạn chế nhóm');
      invalidateGroups();
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể bỏ hạn chế nhóm');
    },
  });

  const updateStatusLocally = (
    groupId: string,
    status: GroupStatus
  ): boolean => {
    let updated = false;
    queryClient.setQueryData<InfiniteData<CursorPageResponse<AdminGroupDTO>>>(
      ['admin-groups'],
      (old) => {
        if (!old) return old;
        updated = true;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((group) =>
              group.groupId === groupId ? { ...group, status } : group
            ),
          })),
        };
      }
    );
    return updated;
  };

  return { banMutation, unbanMutation, updateStatusLocally };
};
