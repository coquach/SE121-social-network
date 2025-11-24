/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { useConversation } from '@/hooks/use-conversation';
import { useGetMesssages } from '@/hooks/use-message';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { MessageBox } from './message-box';
import { useSocket } from '@/components/providers/socket-provider';
import { MessageDTO } from '@/models/message/messageDTO';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export const Body = () => {
  const { userId : currentUserId } = useAuth();
  const { conversationId } = useConversation();
  const { chatSocket } = useSocket();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useGetMesssages(conversationId, { limit: 20 });

  const bottomRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  /** ----------- REALTIME MESSAGES AS SOURCE OF TRUTH ----------- */
  const [realtimeMessages, setRealtimeMessages] = useState<MessageDTO[]>([]);

  /** ----------- HYDRATE FETCHED MESSAGES INTO REALTIME ----------- */
  useEffect(() => {
    if (!data) return;

    const fetchedAll = data.pages.flatMap((p) => p.data).reverse();

    setRealtimeMessages((prev) => {
      const ids = new Set(prev.map((m) => m._id));

      const merged = [...fetchedAll.filter((m) => !ids.has(m._id)), ...prev];

      return merged;
    });
  }, [data]);

  /** ----------- LOAD MORE MESSAGES (PREPEND) ----------- */
  useEffect(() => {
    if (!data) return;

    const lastPage = data.pages.at(-1)?.data ?? [];

    setRealtimeMessages((prev) => {
      const ids = new Set(prev.map((m) => m._id));
      const merged = [...lastPage.filter((m) => !ids.has(m._id)), ...prev];
      return merged;
    });
  }, [data]);

  /** ----------- INFINITE SCROLL ----------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /** ----------- SOCKET JOIN ----------- */
  useEffect(() => {
    if (!conversationId || !chatSocket) return;
    chatSocket.emit('join_conversation', { conversationId });
    return () => {
      chatSocket.emit('leave_conversation', { conversationId });
    };
  }, [conversationId, chatSocket]);

  /** ----------- SOCKET HANDLERS (NO DEPENDENCY ON STATE!) ----------- */
  useEffect(() => {
    if (!conversationId || !chatSocket) return;

    const handleNew = (message: MessageDTO) => {
      setRealtimeMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      if (message.conversationId === conversationId && message.senderId !== currentUserId) {
        // gửi sự kiện đã nhận tin nhắn
        chatSocket.emit('message_delivered', {
          conversationId,
          messageId: message._id,
          deliveredBy: currentUserId,
        });
      }
    };

    const handleSeen = ({ messageId, seenBy }: any) => {
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.seenBy.includes(seenBy)
            ? { ...m, seenBy: [...m.seenBy, seenBy] }
            : m
        )
      );
    };

    const handleDeleted = ({ messageId }: any) => {
      setRealtimeMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    };

    const handleDelivered = ({ messageId, deliveredBy }: any) => {
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !(m.deliveredBy || []).includes(deliveredBy)
            ? { ...m, deliveredBy: [...(m.deliveredBy || []), deliveredBy] }
            : m
        )
      );
    };

    chatSocket.on('message:new', handleNew);
    chatSocket.on('message:seen', handleSeen);
    chatSocket.on('message:deleted', handleDeleted);
    chatSocket.on('message:delivered', handleDelivered);

    return () => {
      chatSocket.off('message:new', handleNew);
      chatSocket.off('message:seen', handleSeen);
      chatSocket.off('message:deleted', handleDeleted);
      chatSocket.off('message:delivered', handleDelivered);
    };
  }, [conversationId, chatSocket, currentUserId]);

  /** ----------- AUTO SCROLL TO BOTTOM ----------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realtimeMessages]);

  /** ----------- LAST SEEN MAP ----------- */
  const lastSeenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (let i = realtimeMessages.length - 1; i >= 0; i--) {
      const m = realtimeMessages[i];
      for (const uid of m.seenBy || []) {
        if (!map[uid]) map[uid] = m._id;
      }
    }
    return map;
  }, [realtimeMessages]);

  /** ----------- DELETE HANDLER ----------- */
  const handleDelete = useCallback(
    (messageId: string) => {
      chatSocket?.emit('delete_message', { conversationId, messageId });

      setRealtimeMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    },
    [chatSocket, conversationId]
  );

  /** ----------- RENDER UI ----------- */
  return (
    <div className="flex-1 h-full overflow-y-auto">
      {(isLoading || isFetchingNextPage) && (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}

      {isError && <ErrorFallback message={error.message} />}

      {!isLoading && !isError && realtimeMessages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">
            Chưa có tin nhắn nào trong cuộc trò chuyện này.
          </p>
        </div>
      )}

      {realtimeMessages.map((message, index) => {
        const isFirst = index === 0;
        return (
          <div key={message._id} ref={isFirst ? ref : null}>
            <MessageBox
              data={message}
              lastSeenMap={lastSeenMap}
              onDelete={handleDelete}
            />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};
