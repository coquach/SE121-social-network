'use client';

import { useParams } from 'next/navigation';
import { UserProfileInfo } from './_components/user-profile-info';
import { ProfileFeed } from './profile-feed';


const ProfilePage = () => {
  const params = useParams();
  const userId = params.userId;

  return (
    <div className='space-y-4'>
      <UserProfileInfo userId={userId as string} />
      <ProfileFeed userId={userId as string} />
    </div>
  );
};

export default ProfilePage;
