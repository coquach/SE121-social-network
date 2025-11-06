'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetFriends, useRemoveFriend } from '@/hooks/use-friend-hook';
import { Button } from '@/components/ui/button';
import { FriendCard } from './_components/friend-card';
import { Loader } from '@/components/loader-componnet';

export const FriendList = () => {
  const { ref, inView } = useInView({
    threshold: 0.3, // chỉ cần cuộn gần cuối là fetch
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    isPending,
  } = useGetFriends({ limit: 12 });

  const { mutateAsync: removeFriend} = useRemoveFriend();

  const handleRemoveFriend = async (id: string) => {
    await removeFriend(id);
  }

  const friends = useMemo(
    () => data?.pages.flatMap((page) => Object.values(page.data)) ?? [],
    [data]
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader size={32} />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-red-50 text-red-600 text-center space-y-2">
        <span>Không thể tải danh sách bạn bè 😢</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {friends.length === 0 ? (
          <div className="w-full col-span-full p-8 text-neutral-500 text-center">
            Hiện không có bạn bè nào.
          </div>
        ) : (
          friends.map((item) => {
            return (
              <FriendCard
                key={item}
                userId={item}
                action={
                  <div className="w-full flex gap-2">
                    <Button
                      size="sm"
                      className=" flex-1"
                    >
                      Nhắn tin
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleRemoveFriend(item)}
                    >
                      Xóa
                    </Button>
                  </div>
                }
              />
            );
          })
        )}
      </div>

      {hasNextPage && (
        <div ref={ref} className="h-10 flex justify-center items-center">
          {isFetchingNextPage && (
            <p className="text-sm text-gray-400 animate-pulse">
              Đang tải thêm...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
