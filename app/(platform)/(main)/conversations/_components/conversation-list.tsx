'use client';
import { ErrorFallback } from '@/components/error-fallback';
import {
  useConversation,
  useGetConversationList,
} from '@/hooks/use-conversation';
import clsx from 'clsx';
import { MessageCirclePlus, Search } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ConversationBox } from './conversation-box';
import { useSocket } from '@/components/providers/socket-provider';
import { ConversationDTO } from '@/models/conversation/conversationDTO';

export const ConversationList = () => {
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
  const { chatSocket } = useSocket();

  const [realtimeConversations, setRealtimeConversations] = useState<
    ConversationDTO[]
  >([]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  const allConversations = useMemo(
    () => {
      const fetched = data?.pages.flatMap((page) => page.data) ?? [];
      return [...realtimeConversations, ...fetched];
    },
    [data?.pages, realtimeConversations]
  );

  const { conversationId, isOpen } = useConversation();

  useEffect(() => {
    if (!chatSocket) return;

    const handleNewConversation = (conversation: ConversationDTO) => {
      setRealtimeConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    };
  })

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

          {/* Danh sách cuộc trò chuyện */}
          {allConversations.map((conv) => (
            <ConversationBox
              key={conv._id}
              data={conv}
              selected={conversationId === conv._id}
            />
          ))}
          {isFetchingNextPage}
          <div ref={ref}></div>
        </div>
      </div>
    </aside>
  );
};
