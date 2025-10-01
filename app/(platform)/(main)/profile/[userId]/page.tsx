'use client';

import { useGetUser } from '@/hooks/use-user-hook';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { UserProfileInfo } from './_components/user-profile-info';

const ProfilePage = () => {
  const params = useParams();
  const userId = params.userId;
  const { data: fetchedUser, isLoading } = useGetUser(userId as string);
  if (isLoading || !fetchedUser) {
    return <div>{/* Skeleton */}</div>;
  }
    return (
      <div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className='relative h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {fetchedUser?.coverImageUrl && (
              <Image
                src={fetchedUser.coverImageUrl}
                alt="Cover Image"
                fill
                className='object-cover w-full h-full'
              />
            )}
          </div>
          <UserProfileInfo userId={userId as string}/>
        </div>
      </div>
    );
};

export default ProfilePage;
