'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { GroupAvatar } from './group-avatar';
import { DirectAvatar } from './direct-avatar';

interface ConversationBoxProps {
  data: ConversationDTO;
  selected?: boolean;
}

export const ConversationBox = ({ data, selected }: ConversationBoxProps) => {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();

  const lastMessage = data.lastMessage;
  const isGroup = data.isGroup;

  /** ----------- OTHER USER (1–1) ----------- */
  const otherUserId = useMemo(() => {
    if (isGroup) return undefined;
    const other = data.participants.find((p) => p !== currentUserId);
    return other || undefined;
  }, [isGroup, data.participants, currentUserId]);

  const { data: otherUser } = useGetUser(otherUserId ?? '');

  /** ----------- SENDER INFO ----------- */
  const { data: senderUser } = useGetUser(lastMessage?.senderId ?? '');

  const handleClick = useCallback(() => {
    router.push(`/conversations/${data._id}`);
  }, [router, data._id]);

  /** ----------- SEEN STATUS ----------- */
  const hasSeen = useMemo(() => {
    if (!lastMessage || !currentUserId) return false;
    if (!Array.isArray(lastMessage.seenBy)) return false;

    return lastMessage.seenBy.includes(currentUserId);
  }, [currentUserId, lastMessage]);

  /** ----------- LAST MESSAGE TEXT ----------- */
  const lastMessageText = useMemo(() => {
    if (!lastMessage) {
      return isGroup
        ? 'Tạo nhóm để bắt đầu trò chuyện'
        : 'Bắt đầu cuộc trò chuyện';
    }

    const isMe = lastMessage.senderId === currentUserId;
    const senderName = isMe
      ? 'Tôi'
      : senderUser
      ? `${senderUser.firstName ?? ''} ${senderUser.lastName ?? ''}`.trim() ||
        'Người khác'
      : 'Người khác';

    if (lastMessage.isDeleted) {
      return `${senderName}: Đã xóa tin nhắn`;
    }

    if (lastMessage.attachments?.length && !lastMessage.content) {
      return `${senderName}: Đã gửi tệp đính kèm`;
    }

    const raw = lastMessage.content ?? '';
    const truncated = raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;

    return `${senderName}: ${truncated || 'Đã gửi tin nhắn'}`;
  }, [lastMessage, currentUserId, senderUser, isGroup]);

  /** ----------- TITLE & SUBTITLE ----------- */
  const title = useMemo(() => {
    if (isGroup) {
      return data.groupName || 'Nhóm không tên';
    }
    if (otherUser) {
      return `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim();
    }

    return 'Cuộc trò chuyện';
  }, [isGroup, otherUser, data.groupName]);

  const subtitle = useMemo(() => {
    if (isGroup) {
      const memberCount = data.participants.length;
      return `${memberCount} thành viên`;
    }
    return lastMessageText;
  }, [isGroup, data.participants.length, lastMessageText]);

  const showExtraLastMessageLine = isGroup; // group có thêm dòng 3

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'w-full relative flex flex-col rounded-lg cursor-pointer transition p-2',
        selected ? 'bg-gray-100' : 'bg-white hover:bg-gray-100'
      )}
    >
      {/* Top row: avatar + title + time */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {isGroup ? (
            <GroupAvatar conversation={data} />
          ) : (
            <DirectAvatar userId={otherUserId} />
          )}

          {/* Title + subtitle */}
          <div className="flex flex-col min-w-0">
            <span
              className={clsx(
                'text-sm truncate',
                hasSeen
                  ? 'font-normal text-gray-900'
                  : 'font-semibold text-black'
              )}
            >
              {title}
            </span>

            <span
              className={clsx(
                'text-xs truncate',
                isGroup
                  ? 'text-gray-500'
                  : hasSeen
                  ? 'text-gray-500'
                  : 'text-gray-900'
              )}
            >
              {subtitle}
            </span>
          </div>
        </div>

        {/* Time */}
        {lastMessage?.createdAt && (
          <p className="ml-2 shrink-0 text-[11px] text-gray-500">
            {formatDistanceToNow(new Date(lastMessage.createdAt), {
              addSuffix: true,
              locale: viVN,
            })}
          </p>
        )}
      </div>

      {/* Extra line cho group để show last message riêng */}
      {showExtraLastMessageLine && lastMessage && (
        <p
          className={clsx(
            'mt-1 ml-12 text-xs truncate',
            hasSeen ? 'text-gray-500' : 'text-gray-900 font-medium'
          )}
        >
          {lastMessageText}
        </p>
      )}
    </div>
  );
};

ConversationBox.Skeleton = function ConversationBoxSkeleton() {
  return (
    <div className="w-full relative flex flex-col rounded-lg p-2 bg-white">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
        <Skeleton className="h-3 w-16 rounded" />
      </div>

      <Skeleton className="h-3 w-40 mt-2 ml-12 rounded" />
    </div>
  );
};
