'use client';

import { useGetUser } from '@/hooks/use-user-hook';
import { useParams } from 'next/navigation';
import { UserHero } from './_components/user-hero';
import { UserBio } from './_components/user-bio';

const ProfilePage = () => {
  const params = useParams();
  const userId = params.userId;
  const { data: fetchedUser, isLoading } = useGetUser(userId as string);
  if (isLoading || !fetchedUser) {
    return <div>{/* Skeleton */}</div>;
  }
  return (
    <div>
      <UserHero userId={userId as string} />
      <UserBio userId={userId as string} />
    </div>
  );
};

export default ProfilePage;
