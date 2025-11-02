'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCard } from '@/components/post/post-card';
import { useProfilePosts } from '@/hooks/use-post-hook';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export const ProfilePosts = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage } =
    useProfilePosts(userId, { limit: 10 });

  const { ref, inView } = useInView();

useEffect(() => {
  if (
    inView &&
    !isFetchingNextPage &&
    data?.pages?.length &&
    data.pages[data.pages.length - 1].page <
      data.pages[data.pages.length - 1].totalPages
  ) {
    fetchNextPage();
  }
}, [inView, fetchNextPage, isFetchingNextPage, data]);

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <div className="space-y-4">
      {isLoading &&
        Array.from({ length: 2 }).map((_, index) => (
          <div key={index}>
            <PostCard.Skeleton />
          </div>
        ))}
      {isError && <ErrorFallback message={error.message} />}
      {!isLoading && !isError && allPosts.length === 0 && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Hiện không có bài viết nào.
        </div>
      )}

      {/* Danh sách bài viết */}
      {allPosts.map((post) => (
        <PostCard key={post.postId} data={post} />
      ))}
      {isFetchingNextPage && <PostCard.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
