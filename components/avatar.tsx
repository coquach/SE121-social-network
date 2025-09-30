import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useCallback } from 'react';

interface AvatarProps {
  userId: string;
  isLarge: boolean;
  hasBorder: boolean;
}

export const Avatar = ({ userId, isLarge, hasBorder }: AvatarProps) => {
  const router = useRouter();
  const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    const url = `/profile/${userId}`;

    router.push(url)
  }, [router, userId]);
  return (
    <div className={`
      ${hasBorder ? 'border-4 border-black' : ''} 
      ${isLarge ? 'h-32' : 'h-12'}
      ${isLarge ? 'w-32' : 'h-12'}
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
          src={}
        />
    </div>
  )
};
