

import { getUser } from '@/lib/actions/user/user-actions';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { UserProfileInfo } from './_components/user-profile-info';
import { ProfileFeed } from './profile-feed';


export default async function ProfilePage ({
  params
}: {
  params: Promise<{ userId: string }>;
})  {
  const { userId } = await params;
  const {getToken} = await auth();
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getUser(token, userId);
    },
  });
  return (
    <div className='p-4'>
   
      <ProfileFeed userId={userId as string} />
    </div>
  );
};

