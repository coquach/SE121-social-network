'use client';

import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';

import { useGetUser } from '@/hooks/use-user-hook';
import { useActiveList } from '@/store/use-active-list';

interface AvatarProps {
  userId: string;
  isSmall?: boolean;
  isLarge?: boolean;
  hasBorder?: boolean;
  reactionEmoji?: string;
  showName?: boolean;
  showStatus?: boolean;
  disableClick?: boolean;
}

export const Avatar = ({
  userId,
  isSmall = false,
  isLarge,
  hasBorder,
  reactionEmoji,
  showName = false,
  showStatus = false,
  disableClick = false,
}: AvatarProps) => {
  const { userId: currentUserId } = useAuth();
  const { data: fetchedUser, isLoading } = useGetUser(userId);
  const router = useRouter();

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disableClick) return;
      event.stopPropagation();
      router.push(`/profile/${userId}`);
    },
    [router, userId, disableClick]
  );

  const isOnline = useActiveList((state) => state.isOnline(userId));
  const presence = useActiveList((state) => state.getById(userId));
  const showPresence = showStatus && userId !== currentUserId;

  const statusText = useMemo(() => {
    if (!showPresence) return '';

    if (!presence || presence.status === 'offline') {
      if (presence?.lastSeen) {
        const ts =
          typeof presence.lastSeen === 'string'
            ? Number(presence.lastSeen)
            : presence.lastSeen;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          return `${formatDistanceToNow(d, {
            addSuffix: true,
            locale: viVN,
          })}`;
        }
      }
      return 'Ngoại tuyến';
    }

    if (presence.status === 'away') {
      return 'Tạm vắng';
    }

    return 'Trực tuyến';
  }, [presence, showPresence]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`
            ${hasBorder ? 'border-2 border-gray-300' : ''} 
            ${isLarge ? 'h-12 w-12' : 'h-8 w-8'}
            ${isSmall ? 'h-1 w-1' : 'h-8 w-8'}
            rounded-full
            animate-pulse
            bg-gray-200
          `}
        />
        {showName && (
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 ${
        showName && !disableClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`
          relative
          ${hasBorder ? 'border-2 border-gray-300' : ''} 
          ${isLarge ? 'h-12 w-12' : isSmall ? 'h-4 w-4' : 'h-8 w-8'}
          ${isSmall ? 'h-1 w-1' : 'h-8 w-8'}
          rounded-full
          hover:opacity-90
        `}
      >
        <Image
          fill
          style={{
            objectFit: 'cover',
            borderRadius: '100%',
          }}
          alt="Avatar"
          src={fetchedUser?.avatarUrl || '/images/placeholder.png'}
        />

        {reactionEmoji && (
          <div
            className="
              absolute -bottom-1 -right-1 
              bg-white rounded-full shadow-md 
              flex items-center justify-center
              w-5 h-5 text-sm
            "
          >
            {reactionEmoji}
          </div>
        )}

        {isOnline && userId !== currentUserId && !isSmall && (
          <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full w-3 h-3" />
        )}
      </div>

      {showName && (
        <div className="flex flex-col max-w-[140px]">
          <span className="text-sm text-slate-700 font-semibold truncate">
            {fetchedUser?.firstName || 'firstName'}{' '}
            {fetchedUser?.lastName || 'lastName'}
          </span>
          {showPresence && (
            <span
              className={`text-xs ${
                isOnline || presence?.status === 'away'
                  ? 'text-green-600'
                  : 'text-gray-400'
              } truncate`}
            >
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
