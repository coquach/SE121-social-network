import {
  createGroup,
  deleteGroup,
  getGroupById,
  getMyGroups,
  getRecommendedGroups,
  updateGroup,
} from '@/lib/actions/group/group-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { CreateGroupForm, GroupDTO, UpdateGroupForm } from '@/models/group/groupDTO';
import { useAuth } from '@clerk/nextjs';
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetMyGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: ['get-my-groups'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getMyGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
  });
};

export const useGetRecommendedGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: ['get-recommended-groups', query],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getRecommendedGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    refetchOnWindowFocus: true,
  });
};

export const useGetGroupById = (groupId: string) => {
  const { getToken } = useAuth();
  return useQuery<GroupDTO>({
    queryKey: ['get-group-by-id', groupId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupById(token, groupId);
    },
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGroupForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await createGroup(token, data);
    },
    onSuccess: (newGroup) => {
      createGroupInCache(queryClient, newGroup);
      queryClient.invalidateQueries({ queryKey: ['get-my-groups'] });
      toast.success('Tạo nhóm thành công');
    },
    onError: () => {
      toast.error('Tạo nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

export const useUpdateGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateGroupForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await updateGroup(token, groupId, data);
    },
    onSuccess: (updatedGroup) => {
      updateGroupInCache(queryClient, updatedGroup);
      queryClient.invalidateQueries({ queryKey: ['get-my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['get-group-by-id', groupId] });
      toast.success('Cập nhật nhóm thành công');
    },
    onError: () => {
      toast.error('Cập nhật nhóm thất bại. Vui lòng thử lại.');
    },
  });     

};

export const useDeleteGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await deleteGroup(token, groupId);
    }
    ,
    onSuccess: () => {
      deleteGroupInCache(queryClient, groupId);
      queryClient.invalidateQueries({ queryKey: ['get-my-groups'] });
      toast.success('Xóa nhóm thành công');
    }
    ,
    onError: () => {
      toast.error('Xóa nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

export


const createGroupInCache = (queryClient: QueryClient, newGroup: GroupDTO) => {
  queryClient.setQueriesData<CursorPageResponse<GroupDTO>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) {
        return {
          data: [newGroup],
          nextCursor: null,
          hasNextPage: false,
        };
      }
      return {
        ...oldData,
        data: [newGroup, ...oldData.data],
      };
    }
  );
  queryClient.setQueriesData<GroupDTO>(
    { queryKey: ['get-group-by-id', newGroup.id] },
    newGroup
  );
};


const updateGroupInCache = (queryClient: QueryClient, updatedGroup: GroupDTO) => {
  queryClient.setQueriesData<CursorPageResponse<GroupDTO>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) {
        return oldData;
      }
      return {
        ...oldData,
        data: oldData.data.map((group) => 
          group.id === updatedGroup.id ? updatedGroup : group
        ),
      };
    }
  );
  queryClient.setQueriesData<GroupDTO>(
    { queryKey: ['get-group-by-id', updatedGroup.id] },
    updatedGroup
  );
};

const deleteGroupInCache = (queryClient: QueryClient, groupId: string) => {
  queryClient.setQueriesData<CursorPageResponse<GroupDTO>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) {
        return oldData;
      } 
      return {
        ...oldData,
        data: oldData.data.filter((group) => group.id !== groupId),
      };
    }
  );
  queryClient.removeQueries({ queryKey: ['get-group-by-id', groupId] });
}
