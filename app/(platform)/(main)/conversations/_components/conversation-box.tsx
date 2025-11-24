'use client';
import { Avatar } from '@/components/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface ConversationBoxProps {
  data: ConversationDTO;
  selected?: boolean;
}

export const ConversationBox = ({ data, selected }: ConversationBoxProps) => {
  const { userId: currentUserId } = useAuth();
  const { data: sender } = useGetUser(data.lastMessage?.senderId);
  const router = useRouter();
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data._id}`);
  }, [router, data._id]);

  const lastMessage = useMemo(() => {
    console.log('Last message:', data.lastMessage);
    return data.lastMessage;
  }, [data.lastMessage]);

  const otherUser = useMemo(() => {
    const other = data.participants.find(
      (participant) => participant !== currentUserId
    );
    return other || ' ';
  }, [data.participants, currentUserId]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) return false;

    return lastMessage.seenBy.includes(currentUserId || '');
  }, [currentUserId, lastMessage]);

  const lastMessageText = useMemo(() => {
    if (!lastMessage) {
      return 'Bắt đầu cuộc trò chuyện';
    }
    const prefix =
      lastMessage.senderId === currentUserId
        ? 'Tôi'
        : `${sender?.firstName} ${sender?.lastName}` || 'Người khác';
    if (lastMessage.isDeleted) {
      return `${prefix}: Đã xóa tin nhắn`;
    }
    // Nếu có attachment
    if (
      lastMessage.attachments &&
      lastMessage.attachments.length > 0 &&
      !lastMessage.content
    ) {
      return `: Đã gửi tệp đính kèm`;
    }

    return `${prefix}: ${lastMessage.content}`;
  }, [lastMessage, currentUserId, sender]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'w-full relative flex flex-col items-start space-x-3 hover:bg-gray-100 rounded-lg cursor-pointer transition p-2',
        selected ? 'bg-gray-100' : 'bg-white'
      )}
    >
      {/* Avatar */}
      <div className="flex justify-between items-center w-full">
        <Avatar userId={otherUser} showName hasBorder />
        {lastMessage?.createdAt && (
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(lastMessage.createdAt))}
          </p>
        )}
      </div>

      <p
        className={clsx(
          'truncate text-sm mt-1 pl-10',
          hasSeen ? 'text-gray-500' : 'text-black font-medium'
        )}
      >
        {lastMessageText}
      </p>
    </div>
  );
};

ConversationBox.Skeleton = function ConversationBoxSkeleton() {
  return (
    <div className="w-full relative flex flex-col items-start space-x-3 rounded-lg p-2 bg-white">
      {/* Avatar + time */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-3 w-16 rounded" />
      </div>

      {/* Last message text */}
      <Skeleton className="h-4 w-40 mt-2 ml-10 rounded" />
    </div>
  );
};
