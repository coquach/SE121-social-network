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
    queryKey: ['comments', query.rootId],
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
      toast.success('Comment created successfully');
    },
    onError: () => {
      toast.error('Failed to create comment');
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
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await updateComment(token, commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Comment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update comment');
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
