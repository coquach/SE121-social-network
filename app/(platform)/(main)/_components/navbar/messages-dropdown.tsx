'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetConversationList } from '@/hooks/use-conversation';
import { useSocket } from '@/components/providers/socket-provider';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
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

const getTimestamp = (value?: Date | string) => {
  if (!value) return 0;
  return new Date(value).getTime();
};

const getConversationUpdatedAt = (conv: ConversationDTO) => {
  const lastMessageTime =
    conv.lastMessage?.updatedAt || conv.lastMessage?.createdAt;
  return getTimestamp(conv.updatedAt) || getTimestamp(lastMessageTime) || getTimestamp(conv.createdAt);
};

const mergeConversation = (
  prev: ConversationDTO | undefined,
  next: ConversationDTO
) => {
  if (!prev) return next;
  return getConversationUpdatedAt(next) >= getConversationUpdatedAt(prev)
    ? next
    : prev;
};

export const MessageDropdown = () => {
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const { data, isLoading } = useGetConversationList({ limit: 10 });
  const [conversationMap, setConversationMap] = useState<
    Record<string, ConversationDTO>
  >({});

  useEffect(() => {
    if (!data) return;
    const fetched = data.pages.flatMap((page) => page.data);

    setConversationMap((prev) => {
      const next = { ...prev };
      fetched.forEach((conv) => {
        next[conv._id] = mergeConversation(prev[conv._id], conv);
      });
      return next;
    });
  }, [data]);

  useEffect(() => {
    if (!chatSocket) return;

    const handleNew = (conversation: ConversationDTO) => {
      setConversationMap((prev) => ({
        ...prev,
        [conversation._id]: mergeConversation(prev[conversation._id], conversation),
      }));
    };

    const handleUpdate = (conversation: ConversationDTO) => {
      setConversationMap((prev) => ({
        ...prev,
        [conversation._id]: mergeConversation(prev[conversation._id], conversation),
      }));
    };

    chatSocket.on('conversation:new', handleNew);
    chatSocket.on('conversation:update', handleUpdate);

    return () => {
      chatSocket.off('conversation:new', handleNew);
      chatSocket.off('conversation:update', handleUpdate);
    };
  }, [chatSocket]);

  const conversations = useMemo(() => {
    const list = Object.values(conversationMap);
    const filtered = userId
      ? list.filter((conv) => !conv.hiddenFor?.includes(userId))
      : list;

    return filtered.sort(
      (a, b) => getConversationUpdatedAt(b) - getConversationUpdatedAt(a)
    );
  }, [conversationMap, userId]);

  const unreadConversationsCount = useMemo(() => {
    if (!userId) return 0;

    return conversations.reduce((count, conv) => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return count;
      if (lastMsg.senderId === userId) return count;
      const seenBy = lastMsg.seenBy ?? [];
      if (!seenBy.includes(userId)) return count + 1;
      return count;
    }, 0);
  }, [conversations, userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative flex items-center justify-center rounded-md p-2 hover:bg-sky-500/10 cursor-pointer">
          <MessageCircle size={22} className="text-sky-400" />
          {unreadConversationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadConversationsCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2 p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ConversationBox.Skeleton key={i} />
            ))
          ) : conversations.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv) => (
              <DropdownMenuItem
                key={conv._id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <Link href={`/conversations/${conv._id}`}>
                  <ConversationBox data={conv} selected={false} />
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuItem asChild>
          <Link
            href="/conversations"
            className="flex w-full items-center justify-center py-2 text-sm text-sky-500 hover:bg-sky-500/10 cursor-pointer"
          >
            {conversations.length > 0
              ? 'Xem tất cả tin nhắn'
              : 'Bắt đầu cuộc trò chuyện mới'}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
