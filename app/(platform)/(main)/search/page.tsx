/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { Card } from '@/components/ui/card';

import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';

import { GroupCardSummary } from '@/components/group-summary-card';
import { PostCard } from '@/components/post/post-card';
import {
  useSearchGroups,
  useSearchPosts,
  useSearchUsers,
} from '@/hooks/use-search-hooks';
import { SearchGroupSortBy } from '@/lib/actions/search/search-actions';
import { GroupDTO } from '@/models/group/groupDTO';
import { UserSearchCard } from './_components/user-search-card';

type SearchType = 'posts' | 'groups' | 'users';

export default function SearchPage() {
  const params = useSearchParams();

  const q = (params.get('q') ?? '').trim();
  const type = ((params.get('type') as SearchType) ?? 'posts') as SearchType;

  // post filters
  const emotion = params.get('emotion') ?? undefined;

  // group filters
  const privacy = (params.get('privacy') as GroupPrivacy) ?? undefined;
  const sortBy = (params.get('sortBy') as SearchGroupSortBy) ?? undefined;

  // user filters

  const isActiveStr = params.get('isActive') ?? undefined;
  const isActive =
    isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;

  // Queries
  const postsQ = useSearchPosts({ query: q, emotion });
  const groupsQ = useSearchGroups({ query: q, privacy, sortBy });
  const usersQ = useSearchUsers({ query: q, isActive });

  const activeQ =
    type === 'posts' ? postsQ : type === 'groups' ? groupsQ : usersQ;

  const items = activeQ.data?.pages.flatMap((p: any) => p ?? []) ?? [];


  // Infinite
  const { ref, inView } = useInView({ rootMargin: '260px' });
  React.useEffect(() => {
    if (!inView) return;
    if (activeQ.hasNextPage && !activeQ.isFetchingNextPage)
      activeQ.fetchNextPage();
  }, [
    inView,
    activeQ.hasNextPage,
    activeQ.isFetchingNextPage,
    activeQ.fetchNextPage,
    activeQ,
  ]);

  // Label tiếng Việt theo type
  const typeLabel =
    type === 'posts' ? 'bài viết' : type === 'groups' ? 'nhóm' : 'người dùng';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-sky-600">
              Kết quả tìm kiếm
            </div>
            <div className="text-sm text-slate-500">
              {q ? (
                <>
                  Đang tìm{' '}
                  <span className="font-semibold text-slate-800">“{q}”</span>
                  <span className="text-slate-400"> • </span>
                  Loại:{' '}
                  <span className="font-medium text-sky-700">{typeLabel}</span>
                </>
              ) : (
                'Hãy nhập từ khóa ở thanh tìm kiếm để xem kết quả tại đây.'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty query */}
      {!q ? (
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            Bạn hãy tìm kiếm từ{' '}
            <span className="font-medium text-sky-700">
              thanh Search trên navbar
            </span>{' '}
            để hiển thị kết quả.
          </div>
        </Card>
      ) : activeQ.isLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {type === 'posts' &&
            Array.from({ length: 3 }).map((_, i) => (
              <PostCard.Skeleton key={i} />
            ))}

          {type === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <GroupCardSummary.Skeleton key={i} />
              ))}
            </div>
          )}

          {type === 'users' &&
            Array.from({ length: 4 }).map((_, i) => (
              <UserSearchCard.Skeleton key={i} />
            ))}
        </div>
      ) : activeQ.isError ? (
        // Error
        <Card className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="text-sm text-red-600 font-medium">
            Có lỗi khi tải kết quả.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(activeQ.error as Error)?.message ?? 'Vui lòng thử lại sau.'}
          </div>
        </Card>
      ) : items.length === 0 ? (
        // No result
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            Không tìm thấy{' '}
            <span className="font-medium text-sky-700">{typeLabel}</span> phù
            hợp với từ khóa{' '}
            <span className="font-semibold text-slate-800">“{q}”</span>.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Thử đổi từ khóa, hoặc chỉnh bộ lọc ở thanh bên trái.
          </div>
        </Card>
      ) : (
        // Results
        <div className="space-y-4">
          {type === 'posts' &&
            items.map((p: any) => <PostCard key={p.postId} data={p} />)}

          {type === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((g: any) => (
                <GroupCardSummary
                  key={g.id}
                  group={
                    {
                      id: g.id,
                      name: g.name,
                      description: g.description,
                      avatarUrl: g.avatarUrl,
                      privacy: g.privacy,
                      members: g.members,
                      createdAt: g.createdAt,
                    } as GroupDTO
                  }
                />
              ))}
            </div>
          )}

          {type === 'users' &&
            items.map((u: any) => <UserSearchCard key={u.id} user={u} />)}

          <div ref={ref as any} />

          {activeQ.isFetchingNextPage && (
            <div className="text-sm text-sky-700 font-medium">
              Đang tải thêm…
            </div>
          )}
          {!activeQ.hasNextPage && (
            <div className="text-sm text-slate-500">
              Đã hiển thị hết kết quả.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
