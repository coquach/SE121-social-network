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
  SharePostSnapshotDTO,
  UpdateSharePostForm,
} from '@/models/social/post/sharePostDTO';
import { useAuth } from '@clerk/nextjs';
import {
  useInfiniteQuery,
  useMutation,
  useQuery
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
      return await sharePost(token, dto);
    },
    onSuccess: () => {
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
      return await updateSharePost(token, shareId, dto);
    },
    onSuccess: () => {
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
}
