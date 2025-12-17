/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useSearchUsers } from '@/hooks/use-search-hooks';
import { DirectAvatar } from '../../../_components/direct-avatar';

export const AddMembersDialog = ({
  open,
  onOpenChange,
  existingUserIds,
  onAdd,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingUserIds: string[];
  onAdd: (userIds: string[]) => void;
  isPending?: boolean;
}) => {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const setDebounced = useDebouncedCallback((value: string) => {
    setDebouncedQ(value.trim());
  }, 300);

  const onChangeQuery = (value: string) => {
    setQ(value);
    setDebounced(value);
  };

  // chỉ call api theo debouncedQ
  const usersQ = useSearchUsers({ query: debouncedQ });

  const items = usersQ.data?.pages.flatMap((p: any) => p.items ?? []) ?? [];

  const filtered = useMemo(
    () => items.filter((u: any) => !existingUserIds.includes(u.id)),
    [items, existingUserIds]
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    onAdd(ids);
  };

  const loading = usersQ.isLoading || usersQ.isFetching;
  const disabledAll = !!isPending;

 

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          // reset nhẹ để lần sau mở không bị nhảy UI
          setQ('');
          setDebouncedQ('');
          setSelected(new Set());
        }
      }}
    >
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className='text-center text-sky-500'>Thêm thành viên</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Tìm theo tên..."
          value={q}
          onChange={(e) => onChangeQuery(e.target.value)}
        />

        {/* ✅ cố định chiều cao để không nhảy */}
        <div className="mt-2 h-[360px] overflow-y-auto rounded-lg border border-gray-200 p-2">
          {/* Loading skeleton (không show fallback user) */}
          {loading && debouncedQ ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="min-w-0 space-y-1">
                      <Skeleton className="h-4 w-40 rounded" />
                      <Skeleton className="h-3 w-56 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Khi chưa nhập gì: giữ khung ổn định */}
              {!debouncedQ ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Nhập từ khoá để tìm người dùng
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Không có kết quả phù hợp.
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((u: any) => {
                    if (!u) return null;
                    const picked = selected.has(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggle(u.id)}
                        className={`w-full flex items-center justify-between gap-3 rounded-lg border p-2 transition cursor-pointer ${
                          picked
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <DirectAvatar userId={u.id} className="h-10 w-10" />
                          <div className="text-left min-w-0">
                            <div className="text-sm font-medium truncate">
                              {`${u.firstName ?? ''} ${
                                u.lastName ?? ''
                              }`.trim()}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {u.email ?? ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {picked ? 'Đã chọn' : 'Chọn'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabledAll}
          >
            Huỷ
          </Button>
          <Button
            onClick={submit}
            disabled={disabledAll || selected.size === 0}
          >
            Thêm ({selected.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
