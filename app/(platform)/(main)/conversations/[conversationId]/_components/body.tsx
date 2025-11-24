'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { useConversation } from '@/hooks/use-conversation';
import { useGetMesssages } from '@/hooks/use-message';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { MessageBox } from './message-box';
import { useSocket } from '@/components/providers/socket-provider';
import { MessageDTO } from '@/models/message/messageDTO';
import { find } from 'lodash';
import { Loader2 } from 'lucide-react';

export const Body = () => {
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
  } = useGetMesssages(conversationId, { limit: 10 });

  const bottomRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  const [realtimeMessages, setRealtimeMessages] = useState<MessageDTO[]>([]);

  // Merge fetched + realtime
  const messages = useMemo(() => {
    const fetched = data?.pages.flatMap((page) => page.data).reverse() ?? [];
    return [...fetched, ...realtimeMessages];
  }, [data, realtimeMessages]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Join/leave conversation
  useEffect(() => {
    if (!conversationId || !chatSocket) return;
    chatSocket.emit('join_conversation', { conversationId });
    return () => {
      chatSocket.emit('leave_conversation', { conversationId });
    };
  }, [conversationId, chatSocket]);

  // Socket listeners
  useEffect(() => {
    if (!conversationId || !chatSocket) return;

    const handleNew = (message: MessageDTO) => {
      const exists = find(realtimeMessages, { _id: message._id });
      if (!exists) {
        setRealtimeMessages((prev) => [...prev, message]);
      }
      // Emit read ngay khi nhận
      chatSocket.emit('read_message', {
        conversationId,
        messageId: message._id,
      });
    };

    const handleSeen = ({
      messageId,
      seenBy,
    }: {
      messageId: string;
      seenBy: string;
    }) => {
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.seenBy.includes(seenBy)
            ? { ...m, seenBy: [...m.seenBy, seenBy] }
            : m
        )
      );
    };

    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setRealtimeMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    };

    const handleDelivered = ({
      messageId,
      deliveredBy,
    }: {
      messageId: string;
      deliveredBy: string;
    }) => {
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
  }, [conversationId, chatSocket, realtimeMessages]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Last seen map tối ưu

   const lastSeenMap = useMemo(() => {
  const map: Record<string, string> = {};
  // duyệt từ cuối mảng (oldest-first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    for (const uid of m.seenBy || []) {
      if (!map[uid]) {
        map[uid] = m._id;
      }
    }
  }
  return map;
}, [messages]);

const handleDelete = useCallback((messageId: string) => {
  chatSocket?.emit('delete_message', { conversationId, messageId });
  setRealtimeMessages((prev) =>
    prev.map((m) =>
      m._id === messageId ? { ...m, isDeleted: true } : m
    )
  );
}, [chatSocket, conversationId]);


  return (
    <div className="flex-1 h-full overflow-y-auto">
      {(isLoading || isFetchingNextPage) && (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      )}
      {isError && <ErrorFallback message={error.message} />}
      {!isLoading && !isError && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">
            Chưa có tin nhắn nào trong cuộc trò chuyện này.
          </p>
        </div>
      )}
      {messages.map((message, index) => {
        const isFirst = index === 0;
        return (
          <div key={message._id} ref={isFirst ? ref : null}>
            <MessageBox data={message} lastSeenMap={lastSeenMap} onDelete={handleDelete} />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
