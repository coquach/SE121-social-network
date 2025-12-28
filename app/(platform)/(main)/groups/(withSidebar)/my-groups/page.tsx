import { getMyGroups } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { MyGroupsList } from './my-groups-list';

export default async function MyGroupsPage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['my-groups'],
    queryFn: () => getMyGroups(token, { limit: 10 }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-full w-full p-4 space-y-6">
        <h1 className="text-xl font-bold text-sky-400">
          Lời mời tham gia nhóm
        </h1>
        <div className="flex items-center justify-center">
          <p className="text-neutral-400">Chưa cập nhật tính năng</p>
        </div>
        <hr />
        <h1 className="text-xl font-bold text-sky-400">Nhóm đã tham gia</h1>
        <div className="p-2">
          <MyGroupsList />
        </div>
      </div>
    </HydrationBoundary>
  );
}
