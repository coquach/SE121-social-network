'use client';
import { ErrorFallback } from '@/components/error-fallback';
import {
  useConversation,
  useGetConversationList,
} from '@/hooks/use-conversation';
import clsx from 'clsx';
import { MessageCirclePlus, Search } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ConversationBox } from './conversation-box';
import { useSocket } from '@/components/providers/socket-provider';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { find } from 'lodash';

export const ConversationList = () => {
  const { chatSocket } = useSocket();
  const { conversationId, isOpen } = useConversation();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetConversationList({ limit: 20 });

  const { ref, inView } = useInView();

  /** ----------- REALTIME CONVERSATIONS AS SOURCE OF TRUTH ----------- */
  const [realtimeConversations, setRealtimeConversations] = useState<
    ConversationDTO[]
  >([]);

  /** ----------- HYDRATE FETCHED CONVERSATIONS INTO REALTIME ----------- */
  useEffect(() => {
    if (!data) return;

    const fetchedAll = data.pages.flatMap((p) => p.data);

    setRealtimeConversations((prev) => {
      const merged = [...prev];
      for (const conv of fetchedAll) {
        if (!find(merged, { _id: conv._id })) {
          merged.push(conv);
        }
      }
      // sort nếu muốn theo updatedAt
      merged.sort((a, b) => {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      });
      return merged;
    });
  }, [data]);

  /** ----------- INFINITE SCROLL ----------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /** ----------- SOCKET HANDLERS ----------- */
  useEffect(() => {
    if (!chatSocket) return;

    const handleNewConversation = (conversation: ConversationDTO) => {
      setRealtimeConversations((prev) => {
        if (find(prev, { _id: conversation._id })) return prev;
        return [conversation, ...prev];
      });
    };

    const handleUpdatedConversation = (conversation: ConversationDTO) => {
      setRealtimeConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? conversation : c))
      );
    };

    chatSocket.on('conversation:new', handleNewConversation);
    chatSocket.on('conversation:update', handleUpdatedConversation);

    return () => {
      chatSocket.off('conversation:new', handleNewConversation);
      chatSocket.off('conversation:update', handleUpdatedConversation);
    };
  }, [chatSocket]);

  /** ----------- RENDER UI ----------- */
  const allConversations = useMemo(
    () => realtimeConversations,
    [realtimeConversations]
  );

  return (
    <aside
      className={clsx(
        'fixed top-16 bottom-0 lg:w-100 lg:block overflow-y-auto border-r border-gray-200 bg-white',
        isOpen ? 'hidden' : 'block w-full left-0'
      )}
    >
      <div className="px-5">
        <div className="flex justify-between mb-4 pt-4">
          <div className="text-2xl font-bold text-neutral-800">Trò chuyện</div>
          <div className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition">
            <MessageCirclePlus size={20} />
          </div>
        </div>
        <div className="mb-4 mt-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm tin nhắn..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-1 focus:ring-neutral-100 text-sm"
            />
          </div>
        </div>
        <div className="space-y-4">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <ConversationBox.Skeleton key={index} />
            ))}
          {isError && <ErrorFallback message={error.message} />}
          {!isLoading && !isError && allConversations.length === 0 && (
            <div className="w-full h-full flex items-center justify-center p-8 text-neutral-500 text-center">
              Không có cuộc trò chuyện nào.
            </div>
          )}

          {allConversations.map((conv) => (
            <div
              key={conv._id}
              className="transition-all duration-300 ease-in-out transform"
            >
              <ConversationBox
                data={conv}
                selected={conversationId === conv._id}
              />
            </div>
          ))}
          {isFetchingNextPage}
          <div ref={ref}></div>
        </div>
      </div>
    </aside>
  );
};
