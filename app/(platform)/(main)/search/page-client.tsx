'use client';

import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { Card } from '@/components/ui/card';
import { GroupCardSummary } from '@/components/group-summary-card';
import { PostCard } from '@/components/post/post-card';
import {
  useSearchGroups,
  useSearchPosts,
  useSearchUsers,
} from '@/hooks/use-search-hooks';
import { SearchGroupSortBy } from '@/lib/actions/search/search-actions';
import { GroupDTO, GroupSummaryDTO } from '@/models/group/groupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { UserDTO } from '@/models/user/userDTO';
import { UserSearchCard } from './_components/user-search-card';

type SearchType = 'posts' | 'groups' | 'users';
const SEARCH_TYPES: SearchType[] = ['posts', 'groups', 'users'];

export default function SearchPageClient() {
  const params = useSearchParams();

  const rawQ = params.get('q') ?? '';
  const q = rawQ.trim();
  const paramType = params.get('type') as SearchType | null;
  const type: SearchType = SEARCH_TYPES.includes(paramType ?? 'posts')
    ? (paramType as SearchType)
    : 'posts';

  // post filters
  const emotion = params.get('emotion') ?? undefined;

  // group filters
  const privacyParam = params.get('privacy') as GroupPrivacy | null;
  const sortByParam = params.get('sortBy') as SearchGroupSortBy | null;
  const privacy = privacyParam ?? undefined;
  const sortBy = sortByParam ?? undefined;

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
  const postItems = postsQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const groupItems = groupsQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const userItems = usersQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const activeItems =
    type === 'posts' ? postItems : type === 'groups' ? groupItems : userItems;

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

  // Label ti §¨ng Vi ¯Øt theo type
  const typeLabel =
    type === 'posts' ? 'bAÿi vi §¨t' : type === 'groups' ? 'nhA3m' : 'ng’ø ¯?i dA1ng';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-sky-600">
              K §¨t qu §œ tAªm ki §¨m
            </div>
            <div className="text-sm text-slate-500">
              {q ? (
                <>
                  Ž?ang tAªm{' '}
                  <span className="font-semibold text-slate-800">ƒ?o{q}ƒ??</span>
                  <span className="text-slate-400"> ƒ?› </span>
                  Lo §­i:{' '}
                  <span className="font-medium text-sky-700">{typeLabel}</span>
                </>
              ) : (
                'HAœy nh §-p t ¯® khA3a  ¯Y thanh tAªm ki §¨m Ž` ¯Ÿ xem k §¨t qu §œ t §­i Ž`A›y.'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty query */}
      {!q ? (
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            B §­n hAœy tAªm ki §¨m t ¯®{' '}
            <span className="font-medium text-sky-700">
              thanh Search trA¦n navbar
            </span>{' '}
            Ž` ¯Ÿ hi ¯Ÿn th ¯< k §¨t qu §œ.
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
            CA3 l ¯-i khi t §œi k §¨t qu §œ.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(activeQ.error as Error)?.message ?? 'Vui lAýng th ¯- l §­i sau.'}
          </div>
        </Card>
      ) : activeItems.length === 0 ? (
        // No result
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            KhA'ng tAªm th §y{' '}
            <span className="font-medium text-sky-700">{typeLabel}</span> phA1
            h ¯œp v ¯>i t ¯® khA3a{' '}
            <span className="font-semibold text-slate-800">ƒ?o{q}ƒ??</span>.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Th ¯- Ž` ¯i t ¯® khA3a, ho §úc ch ¯%nh b ¯T l ¯?c  ¯Y thanh bA¦n trA­i.
          </div>
        </Card>
      ) : (
        // Results
        <div className="space-y-4">
          {type === 'posts' &&
            postItems.map((post: PostSnapshotDTO) => (
              <PostCard key={post.postId} data={post} />
            ))}

          {type === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groupItems.map((group: GroupSummaryDTO) => {
                const groupCard: GroupDTO = {
                  id: group.id,
                  name: group.name,
                  description: group.description,
                  avatarUrl: group.avatarUrl ?? '',
                  coverImageUrl: '',
                  privacy: group.privacy,
                  rules: undefined,
                  members: group.members,
                  status: GroupStatus.ACTIVE,
                  createdAt: group.createdAt,
                };

                return <GroupCardSummary key={group.id} group={groupCard} />;
              })}
            </div>
          )}

          {type === 'users' &&
            userItems.map((user: UserDTO) => (
              <UserSearchCard key={user.id} user={user} />
            ))}

          <div ref={ref} />

          {activeQ.isFetchingNextPage && (
            <div className="text-sm text-sky-700 font-medium">
              Ž?ang t §œi thA¦m...
            </div>
          )}
          {!activeQ.hasNextPage && (
            <div className="text-sm text-slate-500">
              Ž?Aœ hi ¯Ÿn th ¯< h §¨t k §¨t qu §œ.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
