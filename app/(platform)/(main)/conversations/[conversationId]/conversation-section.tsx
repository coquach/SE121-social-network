'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSocket } from '@/components/providers/socket-provider';
import { EmptyState } from '../_components/empty-state';
import { Header } from './_components/header';
import { Body } from './_components/body';
import { FormInput } from './_components/form-input';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useGetConversationById, useMarkConversationAsRead } from '@/hooks/use-conversation';
import { ensureLastSeenMap } from '@/utils/ensure-last-seen-map';

type Props = {
  conversationId: string;
};

export const ConversationSection = ({ conversationId }: Props) => {
  const { chatSocket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Lấy data từ React Query (đã được hydrate từ server)
  const { data: conversation } = useGetConversationById(conversationId);


  const {mutate: markAsRead} = useMarkConversationAsRead(conversationId);




  // Join / leave room + lắng nghe updated/deleted
  useEffect(() => {
    if (!chatSocket || !conversationId) return;

    // join groom
    chatSocket.emit('conversation.join', { conversationId });

    markAsRead(
      conversation?.lastMessage?._id || undefined
    );

    const handleUpdated = (payload: ConversationDTO) => {
      if (payload._id !== conversationId) return;
      // cập nhật cache detail
      queryClient.setQueryData(['conversation', conversationId], payload);
    };

    const handleDeleted = (payload: { id: string }) => {
      if (payload.id !== conversationId) return;
      toast.info('Cuộc trò chuyện đã bị xoá.');
      queryClient.removeQueries({ queryKey: ['conversation', conversationId] });
      router.replace('/conversations');
    };

    const handleRead = (payload: { conversationId: string; userId: string, lastSeenMessageId: string | null }) => {
        if (payload.conversationId !== conversationId) return;
        // cập nhật cache detail
        queryClient.setQueryData<ConversationDTO>(['conversation', conversationId], (old) => {
          if (!old) return old;
          const map = ensureLastSeenMap(old.lastSeenMessageId);
          map.set(payload.userId, payload.lastSeenMessageId || '');
          return {
            ...old,
            lastSeenMessageId: map,
          };
        }
      );
    }

    chatSocket.on('conversation.updated', handleUpdated);
    chatSocket.on('conversation.deleted', handleDeleted);
    chatSocket.on('conversation.read', handleRead);

    return () => {
      chatSocket.emit('conversation.leave', { conversationId });
      chatSocket.off('conversation.updated', handleUpdated);
      chatSocket.off('conversation.deleted', handleDeleted);
      chatSocket.off('conversation.read', handleRead);
    };
  }, [chatSocket, conversation?.lastMessage?._id, conversationId, markAsRead, queryClient, router]);

  // Nếu không có conversation (null/undefined) → EmptyState
  if (!conversation) {
    return (
      <div className="lg:pl-100 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }
  const lastSeenMap = ensureLastSeenMap(conversation.lastSeenMessageId);

  return (
    <div className="lg:pl-100 h-full">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} />
        <Body lastSeenMap={lastSeenMap} />
        <FormInput />
      </div>
    </div>
  );
};
