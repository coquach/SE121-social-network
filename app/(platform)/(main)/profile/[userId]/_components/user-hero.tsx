import { Avatar } from '@/components/avatar';
import { useGetUser } from '@/hooks/use-user-hook';
import Image from 'next/image';

interface UserHeroProps {
  userId: string;
}
export const UserHero = ({ userId }: UserHeroProps) => {
  const { data: fetchedUser } = useGetUser(userId);
  return (
    <div>
      <div className='bg-neutral-700 h-44 relative'>
        {fetchedUser?.coverImageUrl && (
          <Image
            src ={fetchedUser.coverImageUrl}
            fill
            alt='Cover Image'
            style={{objectFit: 'cover'}}
          />
        )}
        <div className='absolute -bottom-16 left-4'>
          <Avatar userId={userId} isLarge hasBorder/>
        </div>
      </div>
    </div>
  )
};
