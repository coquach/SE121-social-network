import { getRecommendedGroups } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ExploreList } from './explore-list';

export default async function GroupExplorePage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      return await getRecommendedGroups(token, { limit: 10 });
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-full w-full p-4 space-y-6">
        <h1 className="text-xl font-bold text-sky-400">Nhóm đề xuất</h1>
        <div className="p-2">
          <ExploreList />
        </div>
      </div>
    </HydrationBoundary>
  );
}
