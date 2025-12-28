'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useGetPostByGroup } from '@/hooks/use-post-hook';

import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { PostGroupStatus } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';

import { PostCard } from '@/components/post/post-card';
import { Badge } from '@/components/ui/badge';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ModerationPostSlide } from './moderation-post-slide';

type Props = {
  groupId: string;
};

export const GroupAdminPostsSection = ({ groupId }: Props) => {
  const { can } = useGroupPermissionContext();
  const canApprovePost = can(GroupPermission.APPROVE_POST);

  const {
    data,
    status: queryStatus,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostByGroup(groupId, {
    limit: 10,
    status: PostGroupStatus.PENDING,
  });

  const allPosts: PostSnapshotDTO[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  // Sentinel cho infinite scroll ngang (ở cuối carousel)
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading
  if (isLoading || queryStatus === 'pending') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-sky-800 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">
                📝
              </span>
              Kiểm duyệt bài viết
            </h2>
            <p className="text-xs text-sky-700/90 mt-0.5">
              Đang tải danh sách bài viết đang chờ phê duyệt...
            </p>
          </div>
          <Badge className="bg-sky-600 hover:bg-sky-700 text-white text-xs border-none">
            Đang tải
          </Badge>
        </div>

        <div className="rounded-xl border border-sky-100 bg-white/90 p-4">
          <PostCard.Skeleton />
        </div>
      </div>
    );
  }

  // Không có quyền
  if (!canApprovePost) {
    return (
      <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 px-4 py-5 text-sm text-sky-800">
        Bạn không có quyền kiểm duyệt bài viết trong nhóm này.
      </div>
    );
  }

  // Lỗi
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        Không thể tải danh sách bài viết.
        {error instanceof Error && (
          <>
            <br />
            <span className="text-xs text-red-500/80">{error.message}</span>
          </>
        )}
      </div>
    );
  }

  const total = allPosts.length;

  return (
    <div className="space-y-4">
      {/* Header đồng bộ sky-500 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-sky-800 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">
              📝
            </span>
            Kiểm duyệt bài viết
          </h2>
          <p className="text-xs text-sky-700/90 mt-0.5">
            {total > 0 ? (
              <>
                Có <b>{total}</b> bài viết đang chờ duyệt. Vuốt sang ngang để
                xem từng bài và phê duyệt.
              </>
            ) : (
              'Hiện chưa có bài viết nào đang chờ phê duyệt.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-sky-600 hover:bg-sky-700 text-white text-xs border-none">
            Đang chờ duyệt: {total}
          </Badge>
        </div>
      </div>

      {/* Content */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white/80 px-6 py-10 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
            <span className="text-lg">📭</span>
          </div>
          <p className="text-sm font-medium text-slate-800">
            Không có bài viết nào đang chờ duyệt
          </p>
          <p className="text-xs text-slate-500">
            Các bài viết mới gửi vào nhóm và cần phê duyệt sẽ hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 bg-white/95 px-2 py-4 sm:px-4 sm:py-5 shadow-sm">
          <Carousel
            className="w-full h-auto"
            opts={{
              align: 'start',
              loop: false,
            }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs text-slate-500">
                Vuốt sang trái/phải hoặc dùng nút điều hướng để duyệt từng bài
                viết.
              </span>
              <div className="flex items-center gap-2">
                <CarouselPrevious className="static h-8 w-8 translate-y-0 border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800" />
                <CarouselNext className="static h-8 w-8 translate-y-0 border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800" />
              </div>
            </div>

            <CarouselContent >
              {allPosts.map((post) => (
                <CarouselItem key={post.postId} className="md:basis-full">
                  <ModerationPostSlide groupId={groupId} post={post} />
                </CarouselItem>
              ))}

              {/* Sentinel cuối carousel để auto load thêm */}
              {hasNextPage && (
                <CarouselItem className="basis-1/2 sm:basis-1/3 flex items-center justify-center">
                  <div
                    ref={ref}
                    className="h-8 flex items-center justify-center text-xs text-sky-600/80"
                  >
                    {isFetchingNextPage
                      ? 'Đang tải thêm bài viết...'
                      : 'Kéo tới đây để tải thêm'}
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
};
