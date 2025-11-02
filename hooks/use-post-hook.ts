'use client';

import { createPost, getMyPosts, getPost, GetPostQuery, getPostsByUser, removePost, updatePost } from '@/lib/actions/social/post/post-action';
import { PageResponse } from '@/lib/pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { CreatePostForm, PostDTO, PostSnapshotDTO, UpdatePostForm } from '@/models/social/post/postDTO';
import { useAuth } from '@clerk/nextjs';
import {
  useInfiniteQuery,
  useMutation,
  useQuery
} from '@tanstack/react-query';
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
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!postId,
  });
};

export const useProfilePosts = (userId: string, query: GetPostQuery) => {
  const { userId: currentUser, getToken } = useAuth();

  return useInfiniteQuery<PageResponse<PostSnapshotDTO>>({
    queryKey: ['posts', userId === currentUser ? 'me' : userId],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      if (userId === currentUser) {
        return getMyPosts(token, { ...query, page: pageParam } as GetPostQuery);
      } else {
        return getPostsByUser(token, userId, {
          ...query,
          page: pageParam,
        } as GetPostQuery);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};



export const useCreatePost = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (create: CreatePostForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await createPost(token, create);
    },
    onMutate: () => {
        toast.loading('Creating post...')
    },
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdatePost = (postId: string, update: UpdatePostForm) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume updatePost is defined elsewhere
      return await updatePost(token, postId, update);
    },
    onMutate: () => {
        toast.loading('Updating post...')
    },
    onSuccess: () => {
      toast.success('Post updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
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
    onMutate: () => {
        toast.loading('Deleting post...')
    },
    onSuccess: () => {
      toast.success('Post deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}