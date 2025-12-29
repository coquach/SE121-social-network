'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { GroupCardSummary } from '@/components/group-summary-card';
import { Loader } from '@/components/loader-componnet';
import {
  useAcceptGroupInvite,
  useDeclineGroupInvite,
  useGetInvitedGroups,
} from '@/hooks/use-groups';
import { GroupDTO } from '@/models/group/groupDTO';

type InvitedGroupCardProps = {
  group: GroupDTO;
};

const InvitedGroupCard = ({ group }: InvitedGroupCardProps) => {
  const { mutate: acceptInvite, isPending: isAccepting } =
    useAcceptGroupInvite(group.id);
  const { mutate: declineInvite, isPending: isDeclining } =
    useDeclineGroupInvite(group.id);

  return (
    <div className="space-y-2">
      <GroupCardSummary group={group} />
      <div className="flex items-center gap-2 justify-between">
        <Button
          onClick={() => acceptInvite()}
          disabled={isAccepting || isDeclining}
          className='flex-1'
        >
          Chấp nhận
        </Button>
        <Button
          variant="outline"
          onClick={() => declineInvite()}
          disabled={isAccepting || isDeclining}
          className='flex-1'
        >
          Từ chối
        </Button>
      </div>
    </div>
  );
};

export const InvitedGroupsList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetInvitedGroups({ limit: 20 });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  const allGroups = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-xl h-full bg-red-50 text-red-600 text-center space-y-2">
        <span>Không thể tải danh sách lời mời</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {allGroups.length === 0 ? (
          <div className="w-full col-span-full p-8 text-neutral-500 text-center font-bold h-full flex items-center justify-center">
            Hiện chưa có lời mời nào.
          </div>
        ) : (
          allGroups.map((item) => (
            <InvitedGroupCard key={item.id} group={item} />
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader size={24} />
        </div>
      )}

      <div ref={ref}></div>
    </div>
  );
};
