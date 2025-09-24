'use client';

import { getUser, updateUser } from '@/lib/actions/user/user-actions';
import { UserDTO, ProfileUpdateForm } from '@/models/user/userDTO';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCurrentUser = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  return user.externalId;
};

export const useGetUser = (userId: string) => {
  const { getToken } = useAuth();
  return useQuery<UserDTO>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getUser(token, userId);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!userId,
  });
};

export const useUpdateUser = (userId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ProfileUpdateForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await updateUser(token, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Update profile successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
