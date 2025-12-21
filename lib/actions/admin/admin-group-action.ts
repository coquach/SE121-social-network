import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { GroupReportDTO } from '@/models/group/groupReportDTO';

export interface GroupReportQuery extends CursorPagination {
  groupId?: string;
}

export const getGroupReports = async (
  token: string,
  query: GroupReportQuery
): Promise<CursorPageResponse<GroupReportDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupReportDTO>>(
      `/groups/reports`,
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

export enum GroupMemberRange {
  LT_100 = 'LT_100', // < 100
  BETWEEN_100_1000 = 'BETWEEN_100_1000',
  GT_1000 = 'GT_1000', // > 1000
}
export interface AdminGroupQuery extends CursorPagination {
  name?: string;
  status?: GroupStatus;
  memberRange?: GroupMemberRange;
}

export const getAdminGroups = async (
  token: string,
  filter: AdminGroupQuery
): Promise<CursorPageResponse<AdminGroupDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<AdminGroupDTO>>(
      `/groups/admin`,
      {
        params: filter,
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


export const banGroup = async (
  token: string,
  groupId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/groups/${groupId}/ban`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
}

export const unbanGroup = async (
  token: string,
  groupId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/groups/${groupId}/unban`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw error;
  } 
}
