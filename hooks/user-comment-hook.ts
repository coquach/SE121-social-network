import { MediaItem } from '@/app/(platform)/(main)/(home)/_components/create-post';
import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  createComment,
  deleteComment,
  getComments,
  GetCommentsQuery,
  updateComment,
} from '@/lib/actions/social/comment/comment-action';
import { PageResponse } from '@/lib/pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import {
  CommentDTO,
  CreateCommentForm,
  UpdateCommentForm,
} from '@/models/social/comment/commentDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetComments = (query: GetCommentsQuery) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<PageResponse<CommentDTO>>({
    queryKey: [
      'comments',
      query.rootId,
      query.parentId || 'root',
      query.rootType,
    ],

    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getComments(token, {
        ...query,
        page: pageParam,
      } as GetCommentsQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 0,
  });
};

export const useCreateComment = (rootId: string) => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      media,
    }: {
      data: CreateCommentForm;
      media?: MediaItem;
    }) => {
      const controller = new AbortController();

      window.addEventListener('beforeunload', () => controller.abort());
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      if (media) {
        const mediaUpload = await uploadToCloudinary(
          media.file,
          media.type === MediaType.IMAGE ? 'image' : 'video',
          `${rootId}/comments/${userId}`,
          controller.signal
        );
        data.media = mediaUpload;
      }
      return await createComment(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Bình luận đã được tạo thành công!' );
    },
    onError: () => {
      toast.error('Tạo bình luận thất bại. Vui lòng thử lại.');
    },
  });
};

export const useUpdateComment = (rootId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentForm;
    }) => {
      console.log('Invalidate key:', ['comments', rootId]);
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await updateComment(token, commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Cập nhật bình luận thành công!');
    },
    onError: () => {
      toast.error('Cập nhật bình luận thất bại!');
    },
  });
};

export const useDeleteComment = (rootId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await deleteComment(token, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
};
