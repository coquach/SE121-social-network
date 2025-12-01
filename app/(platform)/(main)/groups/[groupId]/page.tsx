import { getGroupById } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { de } from 'zod/v4/locales';
import { GroupDetails } from './group-details';
import { CreatePost } from '@/components/create-post';
import { GroupPostList } from './_components/group-post-list';
import { getPostsByGroup } from '@/lib/actions/social/post/post-action';
import { PostGroupStatus } from '@/models/social/enums/social.enum';
import { GroupPermissionProvider } from '@/contexts/group-permission-context';

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
  const group = await queryClient.fetchQuery({
    queryKey: ['get-group-by-id', groupId],
    queryFn: async () => {
      return await getGroupById(token, groupId);
    },
  });
  await queryClient.prefetchQuery({
    queryKey: ['posts', 'group', groupId],
    queryFn: async () => {
      return await getPostsByGroup(token, groupId, { limit: 10, status: PostGroupStatus.PUBLISHED });

    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupPermissionProvider group={group}>
        <div className="w-full p-4 flex flex-col gap-6">
          <CreatePost placeholder="Viết gì đó cho nhóm..." groupId={groupId} />
          <GroupPostList groupId={groupId} />
        </div>
      </GroupPermissionProvider>
    </HydrationBoundary>
  );
}
