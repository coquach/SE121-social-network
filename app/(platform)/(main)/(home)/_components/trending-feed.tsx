'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCard } from '@/components/post/post-card';
import { useGetTrendingFeed } from '@/hooks/use-feed-hook';
import { Emotion } from '@/models/social/enums/social.enum';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export const TrendingFeed = ({
  mainEmotion,
}: {
  mainEmotion?: Emotion;
}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTrendingFeed({ limit: 10, mainEmotion });

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
