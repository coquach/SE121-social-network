import { useSocket } from '@/components/providers/socket-provider';
import { getMessagesByConversationId } from '@/lib/actions/chat/chat-actions';
import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@/lib/cursor-pagination.dto';
import { MediaItem } from '@/lib/types/media';
import { AttachmentDTO, MessageDTO } from '@/models/message/messageDTO';
import { MediaDTO, MediaType } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useCallback, useState } from 'react';

export const useGetMesssages = (
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
  });
};

interface SendMessageDTO {
  conversationId: string;
  content?: string;
  media?: MediaItem[];
  replyTo?: string;
}

export const useSendMessage = () => {
  console.log('useSendMessage called');
  const [isPending, setIsPending] = useState(false);
  const { chatSocket } = useSocket();
  const sendMessage = useCallback(
    async ({ conversationId, content, media, replyTo }: SendMessageDTO) => {
      if (!conversationId || !chatSocket) return;
      setIsPending(true);
      try {
        let attachments: MediaDTO[] | undefined = undefined;
        if (media && media.length > 0) {
          attachments = await uploadMultipleToCloudinary(
            media,
            `conversations/${conversationId}`
          );
        }
        const attachmentsMapped: AttachmentDTO[] | undefined = attachments?.map(
          (item) => ({
            url: item.url,
            mimeType: item.type === MediaType.IMAGE ? 'image' : 'video',
          })
        );
        const dto = {
          conversationId,
          content: content?.trim() || undefined,
          attachments: attachmentsMapped,
          replyTo,
        };
        console.log('Sending message DTO:', dto);

        chatSocket?.emit('send_message', dto);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsPending(false);
      }
    },
    [chatSocket]
  );
  return { sendMessage, isPending };
};
