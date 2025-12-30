import {
  acceptFriendRequest,
  blockUser,
  cancelFriendRequest,
  declineFriendRequest,
  getBlockedUsers,
  getFriendRequests,
  getFriends,
  getFriendSuggestions,
  getUserFriends,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from '@/lib/actions/friend/friend-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { UserDTO } from '@/models/user/userDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type RelationStatus =
  | 'FRIEND'
  | 'BLOCKED'
  | 'REQUESTED_OUT'
  | 'REQUESTED_IN'
  | 'NONE';

type UserSnapshot = UserDTO | undefined;

type OptimisticContext = {
  previousUser?: UserSnapshot;
};

const updateUserRelation = (
  userId: string | undefined,
  status: RelationStatus
) => {
  if (!userId) return undefined;
  const queryClient = getQueryClient();
  queryClient.setQueryData<UserDTO>(['user', userId], (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      relation: {
        ...prev.relation,
        status,
      },
    };
  });
  return queryClient;
};

const snapshotUser = (userId?: string) => {
  if (!userId) return undefined;
  return getQueryClient().getQueryData<UserDTO>(['user', userId]);
};

const restoreUser = (userId?: string, snapshot?: UserSnapshot) => {
  if (!userId || !snapshot) return;
  getQueryClient().setQueryData(['user', userId], snapshot);
};

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

  });
};

export const useGetUserFriends = (query: CursorPagination, userId: string) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: ['get-user-friends', userId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getUserFriends(
        token,
        userId,
        {
          ...query,
          cursor: pageParam,
        } as CursorPagination
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'REQUESTED_OUT');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Gửi lời mời kết bạn thành công!');
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Đã hủy lời mời kết bạn!');
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'FRIEND');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Chấp nhận lời mời kết bạn thành công!');
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friend-requests'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Từ chối lời mời kết bạn thành công!');
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Hủy kết bạn thành công!');
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
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'BLOCKED');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-friends'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Chặn người dùng thành công!');
    },
  });
};

export const useUnblock = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await unblockUser(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-blocked-users'] });
      if (userId)
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Đã bỏ chặn người dùng.');
    },
  });
};
