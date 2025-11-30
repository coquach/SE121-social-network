'use client';

import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  createPost,
  createPostInGroup,
  GetGroupPostQueryDTO,
  getMyPosts,
  getPost,
  GetPostQuery,
  getPostsByGroup,
  getPostsByUser,
  removePost,
  updatePost,
} from '@/lib/actions/social/post/post-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { MediaItem } from '@/lib/types/media';
import { PostGroupStatus } from '@/models/social/enums/social.enum';
import {
  CreatePostForm,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from '@/models/social/post/postDTO';
import { useAuth } from '@clerk/nextjs';
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
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

export const useGetPostByGroup = (groupId: string, query: GetGroupPostQueryDTO) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: ['posts', 'group', groupId, query],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getPostsByGroup(token, groupId, {
        ...query,
        cursor: pageParam,
      } as GetPostQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!groupId,
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

      if (form.groupId) {
        const res = await createPostInGroup(token, form);
        // res: { post, status, message }
        return {
          kind: 'group',
          post: res.post,
          status: res.status,
          message: res.message,
        };
      } else {
        const post = await createPost(token, form);
        return {
          kind: 'profile',
          post,
        };
      }
    },
    onSuccess: (result) => {
      addPostToCache(queryClient, result.post, result.post.groupId);
      if (result.kind === 'profile') {
        toast.success('Đăng bài thành công!');
        queryClient.invalidateQueries({ queryKey: ['trending-feed'] });
      } else {
        // Group post: có thể pending duyệt, hoặc approved
        if (result.status === PostGroupStatus.PUBLISHED) {
          toast.success(result.message || 'Đăng bài trong nhóm thành công!');
          // invalidate feed group nếu bạn có key riêng, ví dụ:
          // queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
        } else {
          toast.success(
            result.message ||
              'Bài đăng đã được gửi và chờ duyệt bởi quản trị viên nhóm.'
          );
        }
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdatePost = (postId: string) => {
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
    onSuccess: (updatedPost) => {
      updatePostInCache(queryClient, updatedPost);
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
      removePostFromCache(queryClient, postId);
      queryClient.invalidateQueries({ queryKey: ['posts'], exact: false });
      toast.success('Xóa bài đăng thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const addPostToCache = (queryClient: QueryClient, newPost: PostSnapshotDTO, groupId?: string) => {
  if (groupId) {
    // Nếu là post trong nhóm, thêm vào cache của trang nhóm
    queryClient.setQueriesData<CursorPageResponse<PostSnapshotDTO>>(
      { queryKey: ['posts', 'group', groupId] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [newPost, ...old.data],
        };
      } );
    return 

  }
  // Thêm vào cache của trang cá nhân
  queryClient.setQueriesData<CursorPageResponse<PostSnapshotDTO>>(
    { queryKey: ['posts', 'me'] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        data: [newPost, ...old.data],
      };
    }
  );
};

// ⚙️ Update 1 post trong mọi page
const updatePostInCache = (
  queryClient: QueryClient,
  updated: PostSnapshotDTO
) => {
  queryClient.setQueriesData<CursorPageResponse<PostSnapshotDTO>>(
    { queryKey: ['posts'] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.map((post) =>
          post.postId === updated.postId ? updated : post
        ),
      };
    }
  );
};

// ⚙️ Xoá post khỏi mọi page
const removePostFromCache = (queryClient: QueryClient, postId: string) => {
  queryClient.setQueriesData<CursorPageResponse<PostSnapshotDTO>>(
    { queryKey: ['posts'] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.filter((post) => post.postId !== postId),
      };
    }
  );
};
