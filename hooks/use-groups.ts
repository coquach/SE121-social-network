import {
  getGroupById,
  getMyGroups,
  getRecommendedGroups,
} from '@/lib/actions/group/group-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { GroupDTO } from '@/models/group/groupDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useGetMyGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: ['get-my-groups'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getMyGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
  });
};

export const useGetRecommendedGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: ['get-recommended-groups', query],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getRecommendedGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    refetchOnWindowFocus: true,
  });
};

export const useGetGroupById = (groupId: string) => {
  const { getToken } = useAuth();
  return useQuery<GroupDTO>({
    queryKey: ['get-group-by-id', groupId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupById(token, groupId);
    },
    enabled: !!groupId,
  });
};
