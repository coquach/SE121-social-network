'use client';

import { getSystemUsers, SystemUserFilter } from '@/lib/actions/admin/admin-users-action';
import { PageResponse } from '@/lib/pagination.dto';
import { SystemUserDTO } from '@/models/user/systemUserDTO';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

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
    keepPreviousData: true,
  });
};
