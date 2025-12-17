'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { useSocket } from '@/components/providers/socket-provider';
import { useMarkReadBuffer } from '@/contexts/mark-read-context';
import { useGetConversationById } from '@/hooks/use-conversation';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { ensureLastSeenMap } from '@/utils/ensure-last-seen-map';
import { EmptyState } from '../_components/empty-state';
import { Body } from './_components/body';
import { FormInput } from './_components/form-input';
import { Header } from './_components/header';

type Props = {
  conversationId: string;
};

export const ConversationSection = ({ conversationId }: Props) => {
  const { chatSocket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userId } = useAuth();

  // data conversation
  const { data: conversation } = useGetConversationById(conversationId);

  const { markRead } = useMarkReadBuffer();

  // lastSeenMap (from cache)
  const lastSeenMap = useMemo(
    () => ensureLastSeenMap(conversation?.lastSeenMessageId),
    [conversation?.lastSeenMessageId]
  );

  const isHiddenForMe = useMemo(() => {
    if (!userId) return false;
    const hidden = conversation?.hiddenFor ?? [];
    return hidden.includes(userId);
  }, [conversation?.hiddenFor, userId]);
  console.log('isHiddenForMe', isHiddenForMe);

  // join/leave socket + listeners (CHỈ phụ thuộc socket + conversationId)
  useEffect(() => {
    if (!chatSocket || !conversationId) return;
    if (isHiddenForMe) return;

    chatSocket.emit('conversation.join', { conversationId });

    const handleUpdated = (payload: ConversationDTO) => {
      if (payload._id !== conversationId) return;
      queryClient.setQueryData(['conversation', conversationId], payload);
    };

    const handleDeleted = (payload: { id: string }) => {
      if (payload.id !== conversationId) return;
      toast.info('Cuộc trò chuyện đã bị xoá.');
      queryClient.removeQueries({ queryKey: ['conversation', conversationId] });
      router.replace('/conversations');
    };
    const handleLeft = (payload: { conversationId: string }) => {
      const id = payload?.conversationId;
      if (!id) return;
      toast.info('Bạn đã rời khỏi cuộc trò chuyện.');
      queryClient.removeQueries({ queryKey: ['conversation', id] });
      router.replace('/conversations');
    };

    const handleRead = (payload: {
      conversationId: string;
      userId: string;
      lastSeenMessageId: string | null;
    }) => {
      if (payload.conversationId !== conversationId) return;

      queryClient.setQueryData<ConversationDTO>(
        ['conversation', conversationId],
        (old) => {
          if (!old) return old;
          const map = ensureLastSeenMap(old.lastSeenMessageId);
          if (payload.lastSeenMessageId) {
            map.set(payload.userId, payload.lastSeenMessageId);
          }
          return { ...old, lastSeenMessageId: map };
        }
      );
    };

    chatSocket.on('conversation.updated', handleUpdated);
    chatSocket.on('conversation.deleted', handleDeleted);
    chatSocket.on('conversation.read', handleRead);
    chatSocket.on('conversation.memberLeft', handleLeft);

    return () => {
      chatSocket.emit('conversation.leave', { conversationId });
      chatSocket.off('conversation.updated', handleUpdated);
      chatSocket.off('conversation.deleted', handleDeleted);
      chatSocket.off('conversation.read', handleRead);
    };
  }, [chatSocket, conversationId, isHiddenForMe, queryClient, router]);

  useEffect(() => {
    const lastMessageId = conversation?.lastMessage?._id ?? null;
    if (!lastMessageId) return;

    markRead({ conversationId, lastMessageId });
  }, [conversationId, conversation?.lastMessage?._id, markRead]);

  // Empty
  if (!conversation) {
    return (
      <div className="lg:pl-100 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-100 h-full">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} />
        <div className="relative flex-1 min-h-0 flex flex-col">
          <Body lastSeenMap={lastSeenMap} />
          <FormInput />

          {isHiddenForMe && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
              <div className="relative z-10 mx-6 max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
                <p className="text-sm font-semibold text-neutral-900">
                  Cuộc trò chuyện đang bị ẩn
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Bạn đã ẩn cuộc trò chuyện này nên tạm thời không thể xem hoặc
                  gửi tin nhắn.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
