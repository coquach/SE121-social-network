'use client';

import { MediaItem } from '@/app/(platform)/(main)/(home)/_components/create-post';
import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  createPost,
  getMyPosts,
  getPost,
  GetPostQuery,
  getPostsByUser,
  removePost,
  updatePost,
} from '@/lib/actions/social/post/post-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import {
  CreatePostForm,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from '@/models/social/post/postDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetPost = (postId: string) => {
  const { getToken } = useAuth();
  return useQuery<PostDTO>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getPost(token, postId);
    },
    enabled: !!postId,
    staleTime: 10_000,
    gcTime: 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useProfilePosts = (userId: string, query: GetPostQuery) => {
  const { userId: currentUser, getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: ['posts', userId === currentUser ? 'me' : userId],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      if (userId === currentUser) {
        return getMyPosts(token, {
          ...query,
          cursor: pageParam,
        } as GetPostQuery);
      } else {
        return getPostsByUser(token, userId, {
          ...query,
          cursor: pageParam,
        } as GetPostQuery);
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
};

export const useCreatePost = () => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      form,
      media,
    }: {
      form: CreatePostForm;
      media?: MediaItem[];
    }) => {
      const controller = new AbortController();

      window.addEventListener('beforeunload', () => controller.abort());
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      console.log('media', form.media);
      if (media && media.length > 0) {
        const uploaded = await uploadMultipleToCloudinary(
          media,
          `posts/${userId}`,
          controller.signal
        );
        form.media = uploaded;
      }

      return await createPost(token, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['trending-feed'] });

      toast.success('Đăng bài thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdatePost = (postId: string, ) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (update: UpdatePostForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume updatePost is defined elsewhere
      return await updatePost(token, postId, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
      toast.success('Chỉnh sửa bài đăng thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeletePost = (postId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume deletePost is defined elsewhere
      return await removePost(token, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
      toast.success('Xóa bài đăng thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
