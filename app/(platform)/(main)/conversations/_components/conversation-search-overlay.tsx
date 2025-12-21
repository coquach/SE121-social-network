'use client';

import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { useSearchUsers } from '@/hooks/use-search-hooks';

import type { UserDTO } from '@/models/user/userDTO';
import { Loader2 } from 'lucide-react';
import { ConversationUserResult } from './conversation-user-result';

export function ConversationSearchOverlay({
  query,
  onPickUser,
  disabled,
}: {
  query: string; // debouncedQuery
  onPickUser: (u: UserDTO) => void;
  disabled?: boolean;
}) {
  const usersQ = useSearchUsers({ query });
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usersQ;

  const items = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '260px' });

  React.useEffect(() => {
    if (!query) return;
    if (!inView) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [query, inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="absolute left-0 right-0 px-5">
      
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 text">
          Kết quả tìm kiếm
        </div>

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pb-2">
          {isLoading ? (
            <div className="px-3 py-4 text-sm text-slate-500 flex items-center gap-2 justify-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang tìm kiếm…
            </div>
          ) : isError ? (
            <div className="px-3 py-4 text-sm text-red-500">
              {(error as Error)?.message ?? 'Tìm kiếm thất bại.'}
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <>
              {items.map((u: UserDTO) => (
                <ConversationUserResult
                  key={u.id}
                  user={u}
                  onPick={onPickUser}
                  disabled={disabled}
                />
              ))}

              <div ref={ref} />

              {isFetchingNextPage && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  Đang tải thêm…
                </div>
              )}
              {!hasNextPage && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  Đã hiển thị hết.
                </div>
              )}
            </>
          )}
        </div>
    
    </div>
  );
}
