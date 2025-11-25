import { getGroupById } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { de } from 'zod/v4/locales';
import { GroupDetails } from './group-details';

export default async function GroupIdPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['get-group-by-id', groupId],
    queryFn: async () => {
      return await getGroupById(token, groupId);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='h-full w-full p-4'>
        <GroupDetails groupId={groupId} />
      </div>
    </HydrationBoundary>
  );
}
