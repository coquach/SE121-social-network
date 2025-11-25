'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCard } from '@/components/post/post-card';
import { useConversation } from '@/hooks/use-conversation';
import { useGetTrendingFeed } from '@/hooks/use-feed-hook';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export const TrendingFeed = () => {
  const { data, isLoading, isError, error, fetchNextPage,hasNextPage, isFetchingNextPage } =
    useGetTrendingFeed({ limit: 10 });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

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
          Không có bài viết xu hướng nào.
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
