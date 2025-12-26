import {
  acceptFriendRequest,
  blockUser,
  cancelFriendRequest,
  declineFriendRequest,
  getBlockedUsers,
  getFriendRequests,
  getFriends,
  getFriendSuggestions,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from '@/lib/actions/friend/friend-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { useAuth } from '@clerk/clerk-react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetFriends = (query: CursorPagination, userId?: string) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: ['get-friends', userId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriends(
        token,
        {
          ...query,
          cursor: pageParam,
        } as CursorPagination,
        userId
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    refetchOnWindowFocus: true,
  });
};

export const useGetFriendRequests = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: ['get-friend-requests'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriendRequests(token, {
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
export const useGetFriendSuggestions = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<
    CursorPageResponse<{
      id: string;
      mutualFriends: number;
      mutualFriendIds: string[];
    }>
  >({
    queryKey: ['get-friend-suggestions'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriendSuggestions(token, {
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

export const useGetBlockedUsers = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: ['get-blocked-users'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getBlockedUsers(token, {
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

export const useRequestFriend = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await sendFriendRequest(token, targetId);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Gửi lời mời kết bạn thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
export const useCancelFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await cancelFriendRequest(token, targetId);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Đã hủy lời mời kết bạn!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAcceptFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await acceptFriendRequest(token, targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Chấp nhận lời mời kết bạn thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRejectFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await declineFriendRequest(token, targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friend-requests'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Từ chối lời mời kết bạn thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveFriend = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await removeFriend(token, targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Xóa bạn thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useBlockUser = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await blockUser(token, targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Chặn người dùng thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUnblock = (userId?: string) => {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await unblockUser(token, targetId);
    },
    onSuccess: () => {
      if (userId)
        getQueryClient().invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Đã bỏ chặn người này!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
