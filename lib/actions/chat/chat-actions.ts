import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { MessageDTO } from '@/models/message/messageDTO';

export const getConversationList = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<ConversationDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<ConversationDTO>>(
      '/chats/conversations',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConversationById = async (
  token: string,
  conversationId: string
): Promise<ConversationDTO> => {
  try {
    const response = await api.get<ConversationDTO>(
      `/chats/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMessagesByConversationId = async (
  token: string,
  conversationId: string,
  query: CursorPagination
): Promise<CursorPageResponse<MessageDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<MessageDTO>>(
      `/chats/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
      }
    );
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

