'use client';

import { useGetReactions } from '@/hooks/use-reaction-hook';
import { reactionsUI } from '@/lib/types/reaction';
import { ReactionType, TargetType } from '@/models/social/enums/social.enum';
import { useReactionModal } from '@/store/use-post-modal';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Avatar } from '../avatar';
import { ErrorFallback } from '../error-fallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const PostReactionsModal = () => {
  const reactionModal = useReactionModal();

  const { targetId, targetType } = reactionModal;
  const [filter, setFilter] = useState<ReactionType | undefined>(undefined);

  // Hook gọi API
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetReactions({
    targetId: targetId ?? '',
    targetType: targetType ?? TargetType.POST,
    reactionType: filter,
  });

  // Infinity scroll
  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
  });

  const allReactions = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  // Gom nhóm reactions theo loại
  const groupedReactions = useMemo(() => {
    const groups: Record<ReactionType, typeof allReactions> = {
      [ReactionType.LIKE]: [],
      [ReactionType.LOVE]: [],
      [ReactionType.HAHA]: [],
      [ReactionType.WOW]: [],
      [ReactionType.SAD]: [],
      [ReactionType.ANGRY]: [],
    };
    allReactions.forEach((r) => {
      if (groups[r.reactionType]) {
        groups[r.reactionType].push(r);
      }
    });
    return groups;
  }, [allReactions]);

  const availableReactions = useMemo(() => {
    return reactionsUI.filter((r) => groupedReactions[r.type]?.length > 0);
  }, [groupedReactions]);

  const totalCount = allReactions.length;

  return (
    <Dialog open={reactionModal.isOpen} onOpenChange={reactionModal.closeModal}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center font-semibold">
            Cảm xúc
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="all"
          value={filter ? filter : 'all'}
          onValueChange={(val) => {
            if (val === 'all') setFilter(undefined);
            else setFilter(val as ReactionType);
          }}
          className="p-4 mb-2 h-[50vh]"
        >
          {/* Tabs List */}
          <TabsList className="flex gap-2 overflow-x-auto px-2 bg-gray-100 rounded-lg h-12">
            {/* Tab ALL */}
            <TabsTrigger
              value="all"
              className="flex items-center justify-center gap-1 shrink-0"
            >
              All ({totalCount})
            </TabsTrigger>

            {/* Tabs cho từng reaction có mặt */}
            {availableReactions.map((r) => (
              <TabsTrigger
                key={r.type}
                value={r.type}
                className="flex items-center justify-center gap-1 text-lg font-medium shrink-0"
              >
                <span className={r.color}>{r.emoji}</span>
                <span className="text-gray-600 text-sm">
                  {groupedReactions[r.type].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Nội dung */}
          <TabsContent
            value={filter ? filter : 'all'}
            className="mt-4 space-y-3 max-h-[400px] overflow-y-auto"
          >
            {isError && (
              <ErrorFallback message="Đã có lỗi xảy ra. Vui lòng thử lại." />
            )}

            {!isLoading &&
              allReactions.map((rx) => {
                const rMeta = reactionsUI.find(
                  (rm) => rm.type === rx.reactionType
                );
                return (
                  <div
                    key={rx.id}
                    className="flex items-center justify-start border-b pb-2"
                  >
                    <Avatar
                      userId={rx.userId}
                      showName
                      reactionEmoji={rMeta?.emoji}
                    />
                  </div>
                );
              })}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin" />
              </div>
            )}

            {/* Sentinel để tự động load thêm */}
            <div ref={ref} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
