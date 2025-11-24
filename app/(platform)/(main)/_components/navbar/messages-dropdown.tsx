'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetConversationList } from '@/hooks/use-conversation';
import { useSocket } from '@/components/providers/socket-provider';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { find } from 'lodash';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageCircle } from 'lucide-react';

import Link from 'next/link';
import { ConversationBox } from '../../conversations/_components/conversation-box';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

export const MessageDropdown = () => {
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const { data, isLoading } = useGetConversationList({ limit: 10 });
  const [realtimeConversations, setRealtimeConversations] = useState<
    ConversationDTO[]
  >([]);

  // Hydrate fetched messages only if not exist in realtime
  useEffect(() => {
    if (!data) return;

    const fetched = data.pages.flatMap((p) => p.data);
    setRealtimeConversations((prev) => {
      const newConvs = fetched.filter((f) => !find(prev, { _id: f._id }));
      return [...prev, ...newConvs]; // prev là source of truth
    });
  }, [data]);




  // Realtime: listen new and update
  useEffect(() => {
    if (!chatSocket) return;

    const handleNew = (conversation: ConversationDTO) => {
      setRealtimeConversations((prev) => {
        if (find(prev, { _id: conversation._id })) return prev;
        return [conversation, ...prev]; // mới lên đầu
      });
    };

    const handleUpdate = (conversation: ConversationDTO) => {
      setRealtimeConversations((prev) => {
        const filtered = prev.filter((c) => c._id !== conversation._id);
        return [conversation, ...filtered]; // cập nhật + lên đầu
      });
    };

    chatSocket.on('conversation:new', handleNew);
    chatSocket.on('conversation:update', handleUpdate);

    return () => {
      chatSocket.off('conversation:new', handleNew);
      chatSocket.off('conversation:update', handleUpdate);
    };
  }, [chatSocket]);


  const unreadConversationsCount = useMemo(() => {
    if (!userId) return 0;

    return realtimeConversations.reduce((count, conv) => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return count; // ko có message thì bỏ qua
      if (!lastMsg.seenBy.includes(userId)) return count + 1;
      return count;
    }, 0);
  }, [realtimeConversations, userId]);




  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative flex items-center justify-center p-2 rounded-md hover:bg-sky-500/10 cursor-pointer">
          <MessageCircle size={22} className="text-sky-400" />
          {unreadConversationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {unreadConversationsCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto bg-white shadow-xl rounded-xl border border-gray-200"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2 p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ConversationBox.Skeleton key={i} />
            ))
          ) : realtimeConversations.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            realtimeConversations.map((conv) => (
              <DropdownMenuItem
                key={conv._id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <Link href={`/conversations/${conv._id}`} >
                  <ConversationBox data={conv} selected={false} />
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {realtimeConversations.length > 0 && (
          <DropdownMenuItem asChild>
            <Link
              href="/conversations"
              className="w-full flex items-center justify-center py-2 text-sm text-sky-500 hover:bg-sky-500/10"
            >
              Xem tất cả
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
