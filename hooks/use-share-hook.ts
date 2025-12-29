import {
  deleteSharePost,
  getMyShares,
  getPostShares,
  getShareById,
  GetShareQuery,
  getUserShares,
  sharePost,
  updateSharePost,
} from '@/lib/actions/social/share/share-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import {
  CreateSharePostForm,
  SharePostDTO,
  SharePostSnapshotDTO,
  UpdateSharePostForm,
} from '@/models/social/post/sharePostDTO';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSharePost = (postId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSharePostForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      const res = await sharePost(token, dto);
      return toShareSnapshot(res);
    },
    onSuccess: (newShare) => {
      addShareToCache(queryClient, newShare, ['shares', postId]);
      queryClient.invalidateQueries({ queryKey: ['shares', postId] });
      toast.success('Chia sẻ bài viết thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateSharePost = (shareId: string, userId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateSharePostForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      const res = await updateSharePost(token, shareId, dto);
      return toShareSnapshot(res);
    },
    onSuccess: (updatedShare) => {
      updateShareInCache(queryClient, updatedShare, ['shares', userId]);
      queryClient.invalidateQueries({ queryKey: ['shares', userId] });
      toast.success('Cập nhật chia sẻ bài viết thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteSharePost = (shareId: string, postId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await deleteSharePost(token, shareId);
    },
    onSuccess: () => {
      removeShareFromCache(queryClient, shareId, ['shares', postId]);
      queryClient.invalidateQueries({ queryKey: ['shares', postId] });
      toast.success('Xóa chia sẻ bài viết thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetShareById = (shareId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['share', shareId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getShareById(token, shareId);
    },
  });
};
export const useGetSharesByPostId = (postId: string, query: GetShareQuery) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<SharePostSnapshotDTO>>({
    queryKey: ['shares', postId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getPostShares(token, postId, {
        ...query,
        cursor: pageParam,
      } as GetShareQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    enabled: !!postId,
  });
};

export const useGetShareByUserId = (userId: string, query: GetShareQuery) => {
  const { getToken, userId: currentUserId } = useAuth();
  return useInfiniteQuery<CursorPageResponse<SharePostSnapshotDTO>>({
    queryKey: ['shares', userId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      if (userId === currentUserId) {
        return await getMyShares(token, {
          ...query,
          cursor: pageParam,
        } as GetShareQuery);
      } else {
        return await getUserShares(token, userId, {
          ...query,
          cursor: pageParam,
        } as GetShareQuery);
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
};

export const addShareToCache = (
  queryClient: QueryClient,
  newShare: SharePostSnapshotDTO,
  key: (string | number)[]
) => {
  queryClient.setQueriesData<
    InfiniteData<CursorPageResponse<SharePostSnapshotDTO>>
  >({ queryKey: key }, (old) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page, index) =>
        index === 0 ? { ...page, data: [newShare, ...page.data] } : page
      ),
    };
  });
};

// 🔥 Update 1 share
export const updateShareInCache = (
  queryClient: QueryClient,
  updated: SharePostSnapshotDTO,
  key: (string | number)[]
) => {
  queryClient.setQueriesData<
    InfiniteData<CursorPageResponse<SharePostSnapshotDTO>>
  >({ queryKey: key }, (old) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.map((share) =>
          share.shareId === updated.shareId ? updated : share
        ),
      })),
    };
  });
};

// 🔥 Xóa share
export const removeShareFromCache = (
  queryClient: QueryClient,
  shareId: string,
  key: (string | number)[]
) => {
  queryClient.setQueriesData<
    InfiniteData<CursorPageResponse<SharePostSnapshotDTO>>
  >({ queryKey: key }, (old) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((share) => share.shareId !== shareId),
      })),
    };
  });
};

// Convert API result → Snapshot để đúng với infiniteQuery cache
export const toShareSnapshot = (data: SharePostDTO): SharePostSnapshotDTO => {
  return {
    shareId: data.id,
    userId: data.userId,
    audience: data.audience,
    content: data.content,
    createdAt: data.createdAt,
    reactedType: data.reactedType,
    shareStat: data.shareStat,
    post: {
      postId: data.post.id,
      userId: data.post.userId,
      audience: data.post.audience,
      group: data.post.group,
      content: data.post.content,
      createdAt: data.post.createdAt,
      reactedType: data.post.reactedType,

      postStat: data.post.postStat,

      // bổ sung nếu còn trường nào trong PostSnapshotDTO
    },
  };
};
