import {
  deleteMessage,
  getMessagesByConversationId,
  sendMessage,
} from '@/lib/actions/chat/chat-actions';
import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { MediaItem } from '@/lib/types/media';
import {
  AttachmentDTO,
  CreateMessageForm,
  MessageDTO,
} from '@/models/message/messageDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { get } from 'lodash';

import { toast } from 'sonner';
import { da } from 'zod/v4/locales';

export const useGetMessages = (
  conversationId: string,
  query: CursorPagination
) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<MessageDTO>>({
    queryKey: ['messages', { conversationId }],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await getMessagesByConversationId(token, conversationId, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!conversationId,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
    gcTime: 60_000,
  });
};

export const useSendMessage = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      form,
      media,
    }: {
      form: CreateMessageForm;
      media?: MediaItem[];
    }) => {
      const controller = new AbortController();

      window.addEventListener('beforeunload', () => controller.abort());
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      if (media && media.length > 0) {
        const uploadResults = await uploadMultipleToCloudinary(
          media.map((m) => m.file),
          `conversations/${form.conversationId}/messages`,
          controller.signal
        );
        const attachmentsMapped: AttachmentDTO[] | undefined =
          uploadResults?.map((item) => ({
            url: item.url,
            mimeType: item.type === MediaType.IMAGE ? 'image' : 'video',
          }));
        form.attachments = attachmentsMapped;
      }
      return await sendMessage(token, form);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', data.conversationId],
      });
    },
    onError: (error) => {
      toast.error(get(error, 'message', 'Không thể gửi tin nhắn.'));
    },
  });
};

export const useDeleteMessage = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await deleteMessage(token, messageId);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      toast.error(get(error, 'message', 'Không thể xóa tin nhắn.'));
    },
  });
};
