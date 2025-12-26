import { getMyFeed, getTrendingFeed, PersonalFeedQuery, TrendingQuery } from "@/lib/actions/feed/feed-action";
import { CursorPageResponse } from "@/lib/cursor-pagination.dto";
import { FeedDTO } from "@/models/feed/feedDTO";
import { PostSnapshotDTO } from "@/models/social/post/postDTO";
import { useAuth } from "@clerk/nextjs";
import { useInfiniteQuery } from "@tanstack/react-query"

export const useGetMyFeed = (query: PersonalFeedQuery) => {
  const { getToken} = useAuth();
  return useInfiniteQuery<CursorPageResponse<FeedDTO>>({
    queryKey: ['my-feed', query.mainEmotion ?? 'ALL'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getMyFeed(token, {
        ...query,
        cursor: pageParam,
      } as PersonalFeedQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export const useGetTrendingFeed = (query: TrendingQuery) => {
  const { getToken} = useAuth();
  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: ['trending-feed', query.mainEmotion ?? 'ALL'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getTrendingFeed(token, {
        ...query,
        cursor: pageParam,
      } as TrendingQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}
