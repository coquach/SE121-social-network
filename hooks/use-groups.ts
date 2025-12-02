import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  approveJoinRequest,
  banMember,
  cancelJoinRequest,
  changeMemberPermission,
  changeMemberRole,
  createGroup,
  createGroupReport,
  deleteGroup,
  getGroupById,
  getGroupJoinRequests,
  getGroupLogs,
  getGroupMembers,
  getGroupReports,
  getGroupSettings,
  getMyGroups,
  getRecommendedGroups,
  GroupLogFilter,
  GroupMemberFilter,
  GroupReportQuery,
  JoinRequestFilter,
  leaveGroup,
  rejectJoinRequest,
  removeMember,
  requestToJoinGroup,
  unbanMember,
  updateGroup,
  updateGroupSettings,
} from '@/lib/actions/group/group-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { MediaItem } from '@/lib/types/media';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { CreateGroupForm, GroupDTO, UpdateGroupForm } from '@/models/group/groupDTO';
import { GroupLogDTO } from '@/models/group/groupLogDTO';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';
import { CreateGroupReportForm, GroupReportDTO } from '@/models/group/groupReportDTO';
import { JoinRequestResponseDTO } from '@/models/group/groupRequestDTO';
import { GroupSettingDTO, UpdateGroupSettingForm } from '@/models/group/groupSettingDTO';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
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
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      form,
      avatar,
      cover,
    }: {
      form: CreateGroupForm;
      avatar?: MediaItem;
      cover?: MediaItem;
    }) => {
      const controller = new AbortController();
      window.addEventListener('beforeunload', () => controller.abort());

      const token = await getToken();
      if (!token) throw new Error('No auth token found');

      // Upload avatar nếu có
      if (avatar) {
        const uploadedAvatar = await uploadToCloudinary(
          avatar.file,
          'image',
          `groups/${userId}/avatar`,
          controller.signal
        );
      
        // ví dụ:
        form.avatarUrl = uploadedAvatar.url ;
      }

      // Upload cover nếu có
      if (cover) {
        const uploadedCover = await uploadToCloudinary(
          cover.file,
          'image',
          `groups/${userId}/cover`,
          controller.signal
        );
        form.coverImageUrl = uploadedCover.url;
      }

      // Gọi API tạo group
      const newGroup = await createGroup(token, form);
      return newGroup;
    },
    onSuccess: (newGroup) => {
      // update cache instant
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
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      form,
      cover,
    }: {
      form: UpdateGroupForm;
      cover?: MediaItem;
    }) => {
      const controller = new AbortController();
      window.addEventListener('beforeunload', () => controller.abort());

      const token = await getToken();
      if (!token) throw new Error('No auth token found');


      // Upload cover mới nếu có
      if (cover) {
        const uploadedCover = await uploadToCloudinary(
          cover.file,
          'image',
          `groups/${userId}/cover`,
          controller.signal
        );
        form.coverImageUrl = uploadedCover.url;
      }

      const updatedGroup = await updateGroup(token, groupId, form);
      return updatedGroup;
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




const createGroupInCache = (queryClient: QueryClient, newGroup: GroupDTO) => {
  // update danh sách "nhóm của tôi"
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page, index) =>
          index === 0
            ? { ...page, data: [newGroup, ...page.data] } // thêm vào page đầu
            : page
        ),
      };
    }
  );

  // cache chi tiết group
  queryClient.setQueriesData<GroupDTO>(
    { queryKey: ['get-group-by-id', newGroup.id] },
    newGroup
  );
};


const updateGroupInCache = (
  queryClient: QueryClient,
  updatedGroup: GroupDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          ),
        })),
      };
    }
  );

  queryClient.setQueriesData<GroupDTO>(
    { queryKey: ['get-group-by-id', updatedGroup.id] },
    updatedGroup
  );
};


const deleteGroupInCache = (queryClient: QueryClient, groupId: string) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: ['get-my-groups'] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((group) => group.id !== groupId),
        })),
      };
    }
  );

  queryClient.removeQueries({ queryKey: ['get-group-by-id', groupId] });
};



/* ====================== SETTINGS ====================== */

export const useGetGroupSettings = (groupId: string) => {
  const { getToken } = useAuth();

  return useQuery<GroupSettingDTO>({
    queryKey: ['group-settings', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupSettings(token, groupId);
    },
  });
};

export const useUpdateGroupSettings = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGroupSettingForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return updateGroupSettings(token, groupId, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<GroupSettingDTO>(
        { queryKey: ['group-settings', groupId] },
        updated
      );
      toast.success('Cập nhật cài đặt nhóm thành công');
    },
    onError: () => {
      toast.error('Cập nhật cài đặt nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

/* ====================== GROUP REPORTS ====================== */

export const useGetGroupReports = (
  groupId: string,
  query: CursorPagination
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupReportDTO>>({
    queryKey: ['group-reports', groupId, query],
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupReports(token, {
        ...query,
        cursor: pageParam,
        groupId,
      } as GroupReportQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
};

export const useCreateGroupReport = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupReportForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return createGroupReport(token, groupId, data);
    },
    onSuccess: (newReport) => {
      addGroupReportToCache(queryClient, groupId, newReport);
      toast.success('Gửi báo cáo nhóm thành công');
    },
    onError: () => {
      toast.error('Gửi báo cáo nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

const addGroupReportToCache = (
  queryClient: QueryClient,
  groupId: string,
  report: GroupReportDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupReportDTO>>>(
    { queryKey: ['group-reports', groupId] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0 ? { ...page, data: [report, ...page.data] } : page
        ),
      };
    }
  );
};

/* ====================== MEMBERS ====================== */

export const useGetGroupMembers = (
  groupId: string,
  filter: GroupMemberFilter
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupMemberDTO>>({
    queryKey: ['group-members', groupId, filter],
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupMembers(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as GroupMemberFilter);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
};

/** Rời nhóm (current user) */
export const useLeaveGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return leaveGroup(token, groupId);
    },
    onSuccess: () => {
      // Xoá nhóm khỏi danh sách "nhóm của tôi"
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
        { queryKey: ['get-my-groups'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((g) => g.id !== groupId),
            })),
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: ['group-members', groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['get-group-by-id', groupId],
      });
      toast.success('Rời khỏi nhóm thành công');
    },
    onError: () => {
      toast.error('Rời khỏi nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

/** Kick thành viên ra khỏi nhóm */
export const useRemoveMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return removeMember(token, groupId, memberId);
    },
    onSuccess: (_, memberId) => {
      removeMemberFromCache(queryClient, groupId, memberId);
      toast.success('Đã xoá thành viên khỏi nhóm');
    },
    onError: () => {
      toast.error('Xoá thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Ban thành viên */
export const useBanMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return banMember(token, groupId, memberId);
    },
    onSuccess: (_, memberId) => {
      // Giản lược: coi như bị ban thì biến khỏi list hiện tại
      removeMemberFromCache(queryClient, groupId, memberId);
      toast.success('Đã chặn thành viên khỏi nhóm');
    },
    onError: () => {
      toast.error('Chặn thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Unban thành viên */
export const useUnbanMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return unbanMember(token, groupId, memberId);
    },
    onSuccess: () => {
      // Tuỳ UI: thường bạn sẽ có tab "banned", ở đây mình chỉ refetch
      queryClient.invalidateQueries({
        queryKey: ['group-members', groupId],
      });
      toast.success('Đã gỡ chặn thành viên');
    },
    onError: () => {
      toast.error('Gỡ chặn thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Đổi role */
export const useChangeMemberRole = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: GroupRole;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return changeMemberRole(token, groupId, memberId, newRole);
    },
    onSuccess: (_, { memberId, newRole }) => {
      updateMemberInCache(queryClient, groupId, memberId, (m) => ({
        ...m,
        role: newRole,
      }));
      toast.success('Cập nhật vai trò thành viên thành công');
    },
    onError: () => {
      toast.error('Cập nhật vai trò thất bại. Vui lòng thử lại.');
    },
  });
};

/** Đổi permission */
export const useChangeMemberPermission = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      permissions,
    }: {
      memberId: string;
      permissions: GroupPermission[];
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return changeMemberPermission(token, groupId, memberId, permissions);
    },
    onSuccess: (_, { memberId, permissions }) => {
      updateMemberInCache(queryClient, groupId, memberId, (m) => ({
        ...m,
        permissions,
      }));
      toast.success('Cập nhật quyền thành viên thành công');
    },
    onError: () => {
      toast.error('Cập nhật quyền thất bại. Vui lòng thử lại.');
    },
  });
};

const removeMemberFromCache = (
  queryClient: QueryClient,
  groupId: string,
  memberId: string
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupMemberDTO>>>(
    { queryKey: ['group-members', groupId] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((m) => m.id !== memberId),
        })),
      };
    }
  );
};

const updateMemberInCache = (
  queryClient: QueryClient,
  groupId: string,
  memberId: string,
  updater: (m: GroupMemberDTO) => GroupMemberDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupMemberDTO>>>(
    { queryKey: ['group-members', groupId] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((m) => (m.id === memberId ? updater(m) : m)),
        })),
      };
    }
  );
};

/* ====================== LOGS ====================== */

export const useGetGroupLogs = (groupId: string, filter: GroupLogFilter) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupLogDTO>>({
    queryKey: ['group-logs', groupId, filter],
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupLogs(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as GroupLogFilter);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
};

/* ====================== JOIN REQUESTS ====================== */

export const useGetGroupJoinRequests = (
  groupId: string,
  filter: JoinRequestFilter
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<JoinRequestResponseDTO>>({
    queryKey: ['group-join-requests', groupId, filter],
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupJoinRequests(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as JoinRequestFilter);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
};

export const useRequestToJoinGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return requestToJoinGroup(token, groupId);
    },
    onSuccess: () => {
      // Cập nhật lại chi tiết group + gợi ý nhóm, nếu đang dùng
      queryClient.invalidateQueries({
        queryKey: ['get-group-by-id', groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ['get-recommended-groups'],
      });
      toast.success('Đã gửi yêu cầu tham gia nhóm');
    },
    onError: () => {
      toast.error('Gửi yêu cầu tham gia thất bại. Vui lòng thử lại.');
    },
  });
};

export const useApproveJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return approveJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      queryClient.invalidateQueries({
        queryKey: ['group-members', groupId],
      });
      toast.success('Đã chấp nhận yêu cầu tham gia');
    },
    onError: () => {
      toast.error('Chấp nhận yêu cầu thất bại. Vui lòng thử lại.');
    },
  });
};

export const useRejectJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return rejectJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      toast.success('Đã từ chối yêu cầu tham gia');
    },
    onError: () => {
      toast.error('Từ chối yêu cầu thất bại. Vui lòng thử lại.');
    },
  });
};

export const useCancelJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return cancelJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      toast.success('Đã huỷ yêu cầu tham gia');
    },
    onError: () => {
      toast.error('Huỷ yêu cầu tham gia thất bại. Vui lòng thử lại.');
    },
  });
};

const removeJoinRequestFromCache = (
  queryClient: QueryClient,
  groupId: string,
  requestId: string
) => {
  queryClient.setQueriesData<
    InfiniteData<CursorPageResponse<JoinRequestResponseDTO>>
  >({ queryKey: ['group-join-requests', groupId] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((r) => r.id !== requestId),
      })),
    };
  });
};
