import api from '@/lib/api-client';
import { PageResponse, Pagination } from '@/lib/pagination.dto';
import { Emotion } from '@/models/social/enums/social.enum';
import {
  CreatePostForm,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from '@/models/social/post/postDTO';

export interface GetPostQuery extends Pagination {
  feeling?: Emotion;
}

export const getPost = async (
  token: string,
  postId: string
): Promise<PostDTO> => {
  try {
    const response = await api.get<PostDTO>(`/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMyPosts = async (
  token: string,
  query: GetPostQuery
): Promise<PageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<PageResponse<PostSnapshotDTO>>(`/posts/me`, {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPostsByUser = async (
  token: string,
  userId: string,
  query : GetPostQuery
): Promise<PageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<PageResponse<PostSnapshotDTO>>(
      `/posts/user/${userId}`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPost = async (token: string, data: CreatePostForm) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value instanceof File) {
        // Nếu là file thì append file
        formData.append(key, value);
      } else {
        // còn lại stringify bình thường
        formData.append(key, value.toString());
      }
    });
    const response = await api.patch(`/posts`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatePost = async (
  token: string,
  postId: string,
  data: UpdatePostForm
) => {
  try {
    const response = await api.patch(`/posts/update/${postId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removePost = async (token: string, postId: string) => {
  try {
    const response = await api.delete(`/post/delete/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
