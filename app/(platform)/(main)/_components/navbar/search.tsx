/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  useSearchGroups,
  useSearchPosts,
  useSearchUsers,
} from '@/hooks/use-search-hooks';
import { IoIosPeople } from 'react-icons/io';
import { BsFillPostcardFill } from 'react-icons/bs';
import { HiUserGroup } from 'react-icons/hi';
import { Avatar } from '@/components/avatar';
import { SuggestionGroupItem } from '@/components/search-suggestions/suggest-group-items';
import { SuggestionPostItem } from '@/components/search-suggestions/suggest-post-items';

type SearchType = 'posts' | 'groups' | 'users';

const TypeRadio = ({
  value,
  onChange,
}: {
  value: SearchType;
  onChange: (v: SearchType) => void;
}) => (
  <RadioGroup
    value={value}
    onValueChange={(v) => onChange(v as SearchType)}
    className="space-y-2"
  >
    <div className="flex items-center gap-2">
      <RadioGroupItem value="users" id="r-users" />
      <Label htmlFor="r-users">
        <IoIosPeople size={20} />
        Mọi người
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="posts" id="r-posts" />

      <Label htmlFor="r-posts">
        <BsFillPostcardFill size={20} />
        Bài đăng
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="groups" id="r-groups" />
      <Label htmlFor="r-groups">
        <HiUserGroup size={20} />
        Nhóm
      </Label>
    </div>
  </RadioGroup>
);

export const Search = () => {
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState<SearchType>('users');

  // suggestions state (desktop)
  const [openSuggest, setOpenSuggest] = React.useState(false);
  const [debouncedQ, setDebouncedQ] = React.useState('');
  const debounce = useDebouncedCallback(
    (v: string) => setDebouncedQ(v.trim()),
    250
  );

  // mobile dialog
  const [openMobile, setOpenMobile] = React.useState(false);

  const wrapperRef = React.useRef<HTMLFormElement | null>(null);
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpenSuggest(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const goSearch = (keyword: string) => {
    const k = keyword.trim();
    if (!k) return;
    setOpenSuggest(false);
    setOpenMobile(false);
    router.push(`/search?q=${encodeURIComponent(k)}&type=${type}`);
  };

  const onChangeQ = (v: string) => {
    setQ(v);
    debounce(v);
    setOpenSuggest(Boolean(v.trim()));
  };

  // ---- Suggestions fetch (optional)
  const postsQ = useSearchPosts({ query: debouncedQ });
  const groupsQ = useSearchGroups({ query: debouncedQ });
  const usersQ = useSearchUsers({ query: debouncedQ });

  const active =
    type === 'posts' ? postsQ : type === 'groups' ? groupsQ : usersQ;
  const loading = debouncedQ ? active.isLoading || active.isFetching : false;
  const items = active.data?.pages?.[0]?.data?.slice(0, 6) ?? [];

  const onPick = (item: any) => {
    setOpenSuggest(false);
    setOpenMobile(false);

    switch (type) {
      case 'posts':
        router.push(`/posts/${item.id}`);
        break;
      case 'groups':
        router.push(`/groups/${item.id}`);
        break;
      case 'users':
        router.push(`/users/${item.id}`);
        break;
    }
  };

  return (
    <>
      {/* ================= Desktop (lg+) ================= */}
      <form
        ref={wrapperRef}
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(q);
        }}
        className="relative hidden lg:flex items-center"
      >
        <Input
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          onFocus={() => setOpenSuggest(Boolean(q.trim()))}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpenSuggest(false);
          }}
          placeholder="Search"
          className="h-9 w-[170px] xl:w-[210px] pl-3 pr-20 rounded-full bg-muted/40
                     focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
        />

        {/* overlay buttons */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                title="Filter"
              >
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-3">
              <div className="text-sm font-medium mb-2">Tìm kiếm theo</div>
              <TypeRadio value={type} onChange={setType} />
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full"
            disabled={!q.trim()}
            title="Search"
          >
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* suggestions dropdown (desktop) */}
        {openSuggest && (
          <div className="absolute z-50 top-11 left-0 w-[360px] rounded-xl border bg-background shadow-lg overflow-hidden">
            <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {type === 'posts'
                  ? 'Bài đăng'
                  : type === 'groups'
                  ? 'Nhóm'
                  : 'Người dùng'}{' '}
                gợi ý
              </span>
              {loading && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-auto">
              {!debouncedQ ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  Nhập từ khoá để tìm.
                </div>
              ) : active.isError ? (
                <div className="px-3 py-3 text-sm text-red-500">
                  {(active.error as Error)?.message ?? 'Search failed'}
                </div>
              ) : items.length === 0 && !loading ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  Không có kết quả.
                </div>
              ) : (
                <>
                  {items.map((it: any) => {
                    if (type === 'posts') {
                      return (
                        <SuggestionPostItem
                          key={it.postId}
                          post={it}
                          onPick={onPick}
                        />
                      );
                    }

                    if (type === 'groups') {
                      return (
                        <SuggestionGroupItem
                          key={it.groupId}
                          group={it}
                          onPick={onPick}
                        />
                      );
                    }

                    return <Avatar hasBorder userId={it.id} key={it.id} />;
                  })}
                </>
              )}
            </div>

            <div className="border-t px-3 py-2 flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => goSearch(q)}
                disabled={!q.trim()}
              >
                Xem tất cả kết quả
              </button>
              <span className="text-[11px] text-muted-foreground">
                Enter để search • Esc để đóng
              </span>
            </div>
          </div>
        )}
      </form>

      {/* ================= Mobile/Tablet (<lg) ================= */}
      <div className="lg:hidden">
        <Dialog open={openMobile} onOpenChange={setOpenMobile}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              title="Search"
            >
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Tìm kiếm</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goSearch(q);
                }}
              />

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium mb-2">Lọc theo </div>
                <TypeRadio value={type} onChange={setType} />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpenMobile(false)}
                >
                  Hủy
                </Button>
                <Button onClick={() => goSearch(q)} disabled={!q.trim()}>
                  Tìm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
