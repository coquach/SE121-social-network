import api from '@/lib/api-client';
import { CursorPageResponse, CursorPagination } from '@/lib/cursor-pagination.dto';
import { PageResponse, Pagination } from '@/lib/pagination.dto';
import { NotificationDTO } from '@/models/notification/notificationDTO';

export const getNotifications = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<NotificationDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<NotificationDTO>>(
      '/notifications',
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
