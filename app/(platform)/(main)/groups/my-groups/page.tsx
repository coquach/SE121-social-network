import { getMyGroups } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { MyGroupsList } from './my-groups-list';

export default async function MyGroupsPage() {
  const { getToken} = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');

  }
  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      return await getMyGroups(token, { limit: 10 });
    }
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='h-full w-full p-4 space-y-6'>
        <h1 className="text-xl font-bold text-sky-400">Danh sách nhóm</h1>
        <div className='p-2'>
          <MyGroupsList />
        </div>
      </div>
    </HydrationBoundary>
  )
}
