
'use client'
import { useGetUser } from '@/hooks/use-user-hook';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useCallback } from 'react';

interface AvatarProps {
  userId: string;
  isLarge?: boolean;
  hasBorder?: boolean;
}

export const Avatar = ({ userId, isLarge, hasBorder }: AvatarProps) => {

  const { data: fetchedUser } = useGetUser(userId);
  const router = useRouter();
  const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    const url = `/profile/${userId}`;

    router.push(url)
  }, [router, userId]);
  return (
    <div className={`
      ${hasBorder ? 'border-2 border-gray-300' : ''} 
      ${isLarge ? 'h-32' : 'h-12'}
      ${isLarge ? 'w-32' : 'w-12'}
      rounded-full
      hover:opacity-90
      cursor-pointer
      relative
    `}>
        <Image
          fill
          style= {{
            objectFit: 'cover',
            borderRadius: '100%'
          }}
          alt='Avatar'
          onClick={onClick}
          src={fetchedUser?.avatarUrl || '/images/placeholder.png'}
        />
    </div>
  )
};
