'use client';



import { reactionsUI } from '@/lib/types/reaction';
import { ReactionType } from '@/models/social/enums/social.enum';
import { usePostModal, useReactionModal } from '@/store/use-post-modal';

import { useMemo } from 'react';
import { Avatar } from '../avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


const mockReactions = [
  { id: 'r1', userId: 'u1', reactionType: ReactionType.LIKE },
  { id: 'r2', userId: 'u2', reactionType: ReactionType.LOVE },
  { id: 'r3', userId: 'u3', reactionType: ReactionType.LOVE },
  { id: 'r4', userId: 'u4', reactionType: ReactionType.HAHA },
  { id: 'r5', userId: 'u5', reactionType: ReactionType.LIKE },
];

export const PostReactionsModal= ()=> {
  const reactionModal = useReactionModal();


  // Gom nhóm reaction theo loại
  const groupedReactions = useMemo(() => {
    const groups: Record<ReactionType, typeof mockReactions> = {
      [ReactionType.LIKE]: [],
      [ReactionType.LOVE]: [],
      [ReactionType.HAHA]: [],
      [ReactionType.WOW]: [],
      [ReactionType.SAD]: [],
      [ReactionType.ANGRY]: [],
    };
    for (const r of mockReactions) {
      if (!groups[r.reactionType]) groups[r.reactionType] = [];
      groups[r.reactionType].push(r);
    }
    return groups;
  }, []);

  // Lọc chỉ những loại có reaction
  const availableReactions = useMemo(() => {
    return reactionsUI.filter((r) => groupedReactions[r.type]?.length);
  }, [groupedReactions]);

  const defaultTab = 'all';
  const totalCount = mockReactions.length;


  return (
    <Dialog open={reactionModal.isOpen} onOpenChange={reactionModal.closeModal}>
      <DialogContent className="max-w-md flex flex-col h-[500px] p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Reactions
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-3">
          {/* Tabs List */}
          <TabsList
        
            className={`w-full grid grid-cols-${
              availableReactions.length + 1
            } bg-gray-100 rounded-lg h-12`}
          >
            {/* Tab ALL */}
            <TabsTrigger
              value="all"
              className="flex items-center justify-center gap-1"
            >
              All ({totalCount})
            </TabsTrigger>

            {/* Tabs chỉ cho các loại reaction có mặt */}
            {availableReactions.map((r) => (
              <TabsTrigger
                key={r.type}
                value={r.type}
                className="flex items-center justify-center gap-1 text-lg font-medium"
              >
                <span className={r.color}>{r.emoji}</span>
                <span className="text-gray-600 text-sm">
                  {groupedReactions[r.type].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content: ALL */}
          <TabsContent
            value="all"
            className="mt-4 space-y-3 max-h-[400px] overflow-y-auto"
          >
            {mockReactions.map((rx) => {
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
          </TabsContent>

          {/* Tab Content: từng loại */}
          {availableReactions.map((r) => (
            <TabsContent
              key={r.type}
              value={r.type}
              className="mt-4 space-y-3 max-h-[400px] overflow-y-auto"
            >
              {groupedReactions[r.type].map((rx) => {
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
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
