'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCard } from '@/components/post/post-card';
import { ShareCard } from '@/components/post/share-post';
import { useGetMyFeed } from '@/hooks/use-feed-hook';
import { FeedDTO, FeedType } from '@/models/feed/feedDTO';
import { Emotion } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export const PersonalFeed = ({
  mainEmotion,
}: {
  mainEmotion?: Emotion;
}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetMyFeed({ limit: 10, mainEmotion });
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  const allFeedItems = useMemo(
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
      {!isLoading && !isError && allFeedItems.length === 0 && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Không có bài viết nào trong bảng tin.
        </div>
      )}

      {/* Danh sách bài viết */}
      {allFeedItems.map((feed: FeedDTO) =>
        feed.type === FeedType.POST ? (
          <PostCard
            key={feed.id}
            data={feed.item as PostSnapshotDTO}
          />
        ) : (
          <ShareCard
            key={feed.id}
            data={feed.item as SharePostSnapshotDTO}
          />
        )
      )}
      {isFetchingNextPage && <PostCard.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
