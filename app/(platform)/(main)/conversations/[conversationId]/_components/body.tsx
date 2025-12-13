'use client';

import { useAuth } from '@clerk/nextjs';
import { format, isToday, isYesterday } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { ErrorFallback } from '@/components/error-fallback';
import { useSocket } from '@/components/providers/socket-provider';
import {
  useConversation,
  useMarkConversationAsRead,
} from '@/hooks/use-conversation';
import { useDeleteMessage, useGetMessages } from '@/hooks/use-message';
import { MessageDTO } from '@/models/message/messageDTO';
import { MessageBox } from './message-box';
import { m } from 'framer-motion';

type BodyProps = {
  // Map<userId, lastSeenMessageId> từ ConversationDTO.lastSeenMessageId
  lastSeenMap: Map<string, string>;
};

export const Body = ({ lastSeenMap }: BodyProps) => {
  const { userId: currentUserId } = useAuth();
  const { conversationId } = useConversation();
  const { chatSocket } = useSocket();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [realtimeMessages, setRealtimeMessages] = useState<MessageDTO[]>([]);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // dùng giá trị "ở đáy" mới nhất trong handler socket
  const isAtBottomRef = useRef(true);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  // cờ để scroll xuống sau khi state cập nhật xong
  const pendingScrollRef = useRef(false);

  // lưu scrollHeight trước khi fetch page cũ
  const prevScrollHeightRef = useRef<number | null>(null);

  // sentinel ở đầu list để load thêm
  const { ref: topRef, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetMessages(conversationId, { limit: 20 });

  // hook mark as read
  const { mutate: markAsRead } = useMarkConversationAsRead(conversationId);

  /** ----------- MERGE DATA (react-query + realtime) ----------- */
  useEffect(() => {
    if (!data) return;

    // đảm bảo sort theo thời gian tăng dần
    const fetched = data.pages
      .flatMap((p) => p.data)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    setRealtimeMessages((prev) => {
      const map = new Map<string, MessageDTO>();

      // base từ server
      fetched.forEach((m) => {
        map.set(m._id, m);
      });

      // overlay từ local (update/delete realtime)
      prev.forEach((m) => {
        map.set(m._id, m);
      });

      return Array.from(map.values());
    });
  }, [data]);

  /** ----------- INFINITE SCROLL (kéo lên đầu) ----------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      // lưu lại scrollHeight hiện tại
      const el = scrollContainerRef.current;
      if (el) {
        prevScrollHeightRef.current = el.scrollHeight;
      }

      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sau khi load thêm page cũ xong, bù lại vị trí scroll
  useEffect(() => {
    if (!isFetchingNextPage && prevScrollHeightRef.current !== null) {
      const el = scrollContainerRef.current;
      if (!el) return;

      const diff = el.scrollHeight - prevScrollHeightRef.current;
      el.scrollTop += diff;

      prevScrollHeightRef.current = null;
    }
  }, [isFetchingNextPage, realtimeMessages.length]);

  /** ----------- SCROLL TO BOTTOM HELPERS ----------- */
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const el = scrollContainerRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior,
      });
      markAsRead(
        realtimeMessages.length > 0
          ? realtimeMessages[realtimeMessages.length - 1]._id
          : undefined
      );
    },
    [markAsRead, realtimeMessages]
  );

  // Lần đầu có data → scroll xuống đáy (không animation)
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (!isInitialScrollDone && realtimeMessages.length > 0) {
      scrollToBottom('auto');
      setIsInitialScrollDone(true);
    }
  }, [isInitialScrollDone, realtimeMessages.length, scrollToBottom]);

  // track user có đang ở gần đáy không
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    const atBottom = distanceToBottom < 80; // threshold ~ 80px
    setIsAtBottom(atBottom);

    if (atBottom) {
      setShowScrollToBottom(false);
    }
  }, []);

  /** ----------- SOCKET HANDLERS (NEW / UPDATED / DELETED) ----------- */
  useEffect(() => {
    if (!conversationId || !chatSocket) return;

    const handleNew = (message: MessageDTO) => {
      if (message.conversationId !== conversationId) return;

      setRealtimeMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // quyết định có scroll không, nhưng CHỈ đặt cờ, chưa scroll ngay
      const isOwn = message.senderId === currentUserId;

      if (isOwn || isAtBottomRef.current) {
        pendingScrollRef.current = true;
        if (!isOwn) {
          markAsRead(message._id);
        }
      } else {
        setShowScrollToBottom(true);
      }
    };

    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? m.isDeleted
              ? m // đã xoá rồi (do optimistic) thì khỏi đổi nữa
              : { ...m, isDeleted: true }
            : m
        )
      );
    };

    chatSocket.on('message.new', handleNew);
    chatSocket.on('message.deleted', handleDeleted);

    return () => {
      chatSocket.off('message.new', handleNew);
      chatSocket.off('message.deleted', handleDeleted);
    };
  }, [chatSocket, conversationId, currentUserId, markAsRead]);

  // Khi realtimeMessages thay đổi và có cờ pendingScroll → scroll sau render
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollToBottom('smooth');
  }, [realtimeMessages.length, scrollToBottom]);

  /** ----------- GROUP BY DATE (UI giống Messenger) ----------- */
  const groupedMessages = useMemo(() => {
    if (!realtimeMessages.length) return [];

    const groups = new Map<string, MessageDTO[]>();

    realtimeMessages.forEach((msg) => {
      const d = new Date(msg.createdAt);
      const key = format(d, 'yyyy-MM-dd');
      const arr = groups.get(key) ?? [];
      arr.push(msg);
      groups.set(key, arr);
    });

    const sortedKeys = Array.from(groups.keys()).sort();

    return sortedKeys.map((key) => {
      const msgs = (groups.get(key) ?? []).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const firstDate = new Date(msgs[0].createdAt);
      let label: string;
      if (isToday(firstDate)) label = 'Hôm nay';
      else if (isYesterday(firstDate)) label = 'Hôm qua';
      else
        label = format(firstDate, "EEEE, dd 'tháng' MM, yyyy", {
          locale: viVN,
        });

      return {
        dateKey: key,
        dateLabel: label,
        messages: msgs,
      };
    });
  }, [realtimeMessages]);

  const deleteMutation = useDeleteMessage();

  const handleDelete = useCallback(
    (messageId: string) => {
      if (!conversationId) return;

      deleteMutation.mutate(messageId);

      // Optimistic: cập nhật local state ngay
      setRealtimeMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    },
    [conversationId, deleteMutation]
  );

  /** ----------- LOADING / ERROR / EMPTY ----------- */
  if (isLoading && !data) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <ErrorFallback message={error?.message ?? 'Đã xảy ra lỗi'} />
      </div>
    );
  }

  if (!groupedMessages.length) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <p className="text-gray-500">
          Chưa có tin nhắn nào trong cuộc trò chuyện này.
        </p>
      </div>
    );
  }

  /** ----------- RENDER UI ----------- */
  return (
    <div
      ref={scrollContainerRef}
      className="relative flex-1 h-full overflow-y-auto p-2 flex flex-col justify-end"
      onScroll={handleScroll}
    >
      {/* Loader khi đang load thêm page cũ */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Sentinel để detect đang ở top list */}
      <div ref={topRef} />

      {groupedMessages.map((group) => (
        <div key={group.dateKey}>
          {/* Header ngày giống Messenger */}
          <div className="my-4 flex items-center justify-center">
            <div className="px-3 py-1 rounded-full bg-gray-200 text-[11px] font-medium text-gray-700">
              {group.dateLabel}
            </div>
          </div>

          {group.messages.map((message) => (
            <MessageBox
              key={message._id}
              data={message}
              lastSeenMap={lastSeenMap}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ))}

      <div ref={bottomRef} />

      {/* Nút “Tin nhắn mới” khi đang ở trên mà có message mới */}
      {showScrollToBottom && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom('smooth');
            setShowScrollToBottom(false);
          }}
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white shadow-md hover:bg-sky-600 cursor-pointer"
        >
          Tin nhắn mới
        </button>
      )}
    </div>
  );
};
