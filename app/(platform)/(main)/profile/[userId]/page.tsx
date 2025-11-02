'use client';

import { useParams } from 'next/navigation';
import { UserProfileInfo } from './_components/user-profile-info';
import { ProfilePosts } from './_components/profile-posts';

const ProfilePage = () => {
  const params = useParams();
  const userId = params.userId;

  return (
    <div className='space-y-4'>
      <UserProfileInfo userId={userId as string} />
      <ProfilePosts userId={userId as string } />
    </div>
  );
};

export default ProfilePage;
