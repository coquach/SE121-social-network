import { auth } from '@clerk/nextjs/server';

import {
  getGroupMembers,
  GroupMemberFilter,
} from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { GroupMemberStatus } from '@/models/group/enums/group-member-status.enum';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { MemberSection } from './member-section';

type MembersPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupMembersPage({ params }: MembersPageProps) {
  const { groupId } = await params;

  const queryClient = getQueryClient();
  const { getToken } = await auth();
  const token = await getToken();

  const filter: GroupMemberFilter = {
    status: GroupMemberStatus.ACTIVE,
    limit: 20,
  };

  if (token) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['group-members', groupId, filter],
      queryFn: ({ pageParam }) =>
        getGroupMembers(token, groupId, {
          ...filter,
          cursor: pageParam,
        } as GroupMemberFilter),
      initialPageParam: undefined,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
 
        <MemberSection groupId={groupId} />
    
    </HydrationBoundary>
  );
}
