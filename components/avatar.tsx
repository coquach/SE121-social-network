'use client';
import { useGetUser } from '@/hooks/use-user-hook';
import { useActiveList } from '@/store/use-active-list';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface AvatarProps {
  userId: string;
  isSmall?: boolean;
  isLarge?: boolean;
  hasBorder?: boolean;
  reactionEmoji?: string; // ví dụ ❤️ 😂 😡
  showName?: boolean; // hiển thị tên kế bên
  showStatus?: boolean;
  disableClick?: boolean; // mới thêm
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
      if (disableClick) return; // nếu disableClick thì không làm gì
      event.stopPropagation();
      router.push(`/profile/${userId}`);
    },
    [router, userId, disableClick]
  );

  const isOnline = useActiveList((state) => state.isOnline(userId));

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
        <div className="flex flex-col max-w-[120px]">
          <span className="text-sm text-neutral-700 font-semibold truncate">
            {fetchedUser?.firstName || 'firstName'}{' '}
            {fetchedUser?.lastName || 'lastName'}
          </span>
          {showStatus && (
            <span
              className={`text-xs ${
                isOnline ? 'text-green-600' : 'text-gray-400'
              } truncate`}
            >
              {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};