'use client';

import {
  banUser,
  createSystemUser,
  getSystemUsers,
  SystemUserFilter,
  unbanUser,
  updateSystemUserRole,
} from '@/lib/actions/admin/admin-users-action';
import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import { PageResponse } from '@/lib/pagination.dto';
import { MediaItem } from '@/lib/types/media';
import {
  CreateSystemUserDTO,
  SystemRole,
  SystemUserDTO,
} from '@/models/user/systemUserDTO';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSystemUsers = (filter: SystemUserFilter) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<SystemUserDTO>>({
    queryKey: ['admin-system-users', filter],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getSystemUsers(token, filter);
    },
    staleTime: 10_000,
    gcTime: 120_000,
    placeholderData: keepPreviousData,
  });
};

type AdminSystemUserCache = PageResponse<SystemUserDTO>;

export const useCreateSystemUser = () => {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin-system-users', 'create'],
    mutationFn: async ({
      form,
      avatar,
    }: {
      form: CreateSystemUserDTO;
      avatar?: MediaItem;
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');

        const payload = { ...form } as CreateSystemUserDTO;

        if (avatar) {
          const uploaded = await uploadToCloudinary(
            avatar.file,
            'image',
            `system-users/${userId ?? 'admin'}/avatar`,
            signal
          );

          payload.avatarUrl = uploaded.url;
        }

        return createSystemUser(token, payload);
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi tạo người dùng');
    },
    onSuccess: () => {
      // const previousQueries = queryClient.getQueriesData<AdminSystemUserCache>({
      //   queryKey: ['admin-system-users'],
      // });

      // previousQueries.forEach(([key, cache]) => {
      //   if (!cache) return;

      //   const total = cache.total + 1;
      //   const limit = cache.limit || cache.data.length || 1;
      //   const updated: AdminSystemUserCache = {
      //     ...cache,
      //     total,
      //     totalPages: Math.max(cache.totalPages, Math.ceil(total / limit)),
      //     data: [newUser, ...cache.data].slice(0, limit),
      //   };

      //   queryClient.setQueryData(key, updated);
      // });

      toast.success('Tạo tài khoản hệ thống thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
    },
  });
};
export const useUpdateUserRole = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['admin-system-users', 'update-role'],
    mutationFn: async (data: { userId: string; role: SystemRole }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return updateSystemUserRole(token, data.userId, data.role);
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi cập nhật vai trò người dùng');
    },
    onSuccess: () => {
      toast.success('Cập nhật vai trò người dùng thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
    },
  });
};

export const useBanUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['admin-system-users', 'ban'],
    mutationFn: async (userIdToBan: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return banUser(token, userIdToBan);
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi khóa người dùng');
    },
    onSuccess: () => {
      toast.success('Khóa tài khoản người dùng thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'], });
    },
  });
};

export const useUnbanUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['admin-system-users', 'unban'],
    mutationFn: async (userIdToUnban: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return unbanUser(token, userIdToUnban);
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi mở khóa người dùng');
    },
    onSuccess: () => {
      toast.success('Mở khóa tài khoản người dùng thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
    },
  }); 
};
