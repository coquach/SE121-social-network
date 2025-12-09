// components/chat/group-conversation-avatar.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useGetUser } from '@/hooks/use-user-hook';

type GroupConversationAvatarProps = {
  conversation: ConversationDTO;
  className?: string;
};

export const GroupAvatar = ({
  conversation,
  className,
}: GroupConversationAvatarProps) => {
  const { userId: currentUserId } = useAuth();

  // lấy tối đa 3 member khác mình
  const otherMemberIds = conversation.participants
    .filter((p) => p !== currentUserId)
    .slice(0, 3);

  const [memberId1, memberId2, memberId3] = otherMemberIds;
  const { data: member1 } = useGetUser(memberId1 ?? '');
  const { data: member2 } = useGetUser(memberId2 ?? '');
  const { data: member3 } = useGetUser(memberId3 ?? '');

  // Nếu có groupAvatar riêng thì dùng luôn
  if (conversation.groupAvatar) {
    const initial =
      (conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() || 'G';

    return (
      <Avatar className={className ?? 'h-10 w-10'}>
        <AvatarImage
          src={conversation.groupAvatar}
          alt={conversation.groupName ?? 'Group'}
        />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
    );
  }

  const circles = [
    { user: member1, id: memberId1, className: 'left-0 z-30' },
    { user: member2, id: memberId2, className: 'left-3 z-20' },
    { user: member3, id: memberId3, className: 'left-6 z-10' },
  ];

  const getInitial = (u?: { firstName?: string; lastName?: string }) => {
    if (!u) {
      return (
        (conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() || 'G'
      );
    }
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return (full || 'U').trim().charAt(0).toUpperCase();
  };

  const getAvatarUrl = (u?: { avatarUrl?: string }) =>
    u?.avatarUrl ?? undefined;

  const availableCount = otherMemberIds.length;

  return (
    <div className={clsx('relative h-10 w-10', className)}>
      {circles.map((c, index) => {
        if (index >= availableCount) return null;

        const u = c.user;
        const url = getAvatarUrl(u);
        const initial = getInitial(u);

        return (
          <Avatar
            key={c.id ?? `group-slot-${index}`}
            className={clsx(
              'h-7 w-7 absolute top-1/2 -translate-y-1/2 border-2 border-white bg-gray-200 text-[10px]',
              c.className
            )}
          >
            {url && <AvatarImage src={url} alt={initial} />}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        );
      })}

      {/* Không có member nào khác → fallback 1 avatar chữ cái tên nhóm */}
      {availableCount === 0 && (
        <Avatar className="h-10 w-10 bg-gray-200 border border-white text-xs">
          <AvatarFallback>
            {(conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() ||
              'G'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
