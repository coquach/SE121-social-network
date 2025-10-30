'use client';
import { useGetUser } from '@/hooks/use-user-hook';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface AvatarProps {
  userId: string;
  isLarge?: boolean;
  hasBorder?: boolean;
  isOnline?: boolean;
  reactionEmoji?: string; // ví dụ ❤️ 😂 😡
  showName?: boolean; // hiển thị tên kế bên
}

export const Avatar = ({
  userId,
  isLarge,
  hasBorder,
  isOnline,
  reactionEmoji,
  showName = false,
}: AvatarProps) => {
  const { data: fetchedUser, isLoading } = useGetUser(userId);
  const router = useRouter();

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      router.push(`/profile/${userId}`);
    },
    [router, userId]
  );

  if (isLoading) {
    return (
      <div
        className={`
          flex items-center gap-3
        `}
      >
        <div
          className={`
          ${hasBorder ? 'border-2 border-gray-300' : ''} 
          ${isLarge ? 'h-32 w-32' : 'h-12 w-12'}
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
      className={`flex items-center gap-3 ${showName ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`
          relative
          ${hasBorder ? 'border-2 border-gray-300' : ''} 
          ${isLarge ? 'h-32 w-32' : 'h-12 w-12'}
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

  
        {isOnline && (
          <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full w-3 h-3" />
        )}
      </div>

      {showName && (
        <span className="text-sm font-medium text-gray-900">
          {fetchedUser?.firstName} {fetchedUser?.lastName}
        </span>
      )}
    </div>
  );
};
