import type { CursorPageResponse } from './cursor-pagination.dto';

/**
 * Standardized getNextPageParam for infinite queries using cursor pagination.
 * 
 * Returns the next cursor if there are more pages, otherwise undefined.
 * This ensures consistent behavior across all infinite queries.
 * 
 * @param lastPage - The last page of data from the infinite query
 * @returns The next cursor or undefined
 * 
 * @example
 * ```ts
 * useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: async ({ pageParam }) => fetchPosts(pageParam),
 *   getNextPageParam: getStandardNextPageParam,
 *   initialPageParam: undefined,
 * })
 * ```
 */
export function getStandardNextPageParam<T>(
  lastPage: CursorPageResponse<T>
): string | undefined {
  return lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined;
}
