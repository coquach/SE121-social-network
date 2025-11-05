'use client';

import { useDisReact, useReact } from '@/hooks/use-reaction-hook';
import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { cn } from '@/lib/utils';
import {
  ReactionType,
  RootType,
  TargetType,
} from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { useCommentModal, useCreateShareModal } from '@/store/use-post-modal';
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { ReactionHoverPopup } from '../reaction-hover-popup';
import { Button } from '../ui/button';

interface PostActionsProps {
  reactType?: ReactionType;
  rootType: RootType;
  rootId: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean;
}

export default function PostActions({
  reactType,
  rootType,
  rootId,
  data,
  isShare,
}: PostActionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { mutateAsync: react } = useReact(rootId);
  const { mutateAsync: disReact } = useDisReact(rootId);
  const reaction = reactType
    ? reactionsUI.find((r) => r.type === reactType)
    : null;

  const [selected, setSelected] = useState<Reaction | null>(reaction ?? null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowReactions(false);
    }, 150); // Delay 150ms trước khi ẩn
  };

  const handleSelect = async (reaction: Reaction | null) => {
    setShowReactions(false);
    if (!reaction) return;

    const isSame = selected && selected.type === reaction.type;

    setSelected(isSame ? null : reaction);

    try {
      if (isSame) {
        await disReact({
          targetId: rootId,
          targetType: isShare ? TargetType.POST : TargetType.SHARE,
        });
      } else {
        await react({
          targetId: rootId,
          targetType: isShare ? TargetType.POST : TargetType.SHARE,
          reactionType: reaction.type,
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      setSelected(selected);
    }
  };

  const handleQuickReact = async () => {
    if (selected) {
      // Đã like rồi thì bỏ like
      await disReact({
        targetId: rootId,
        targetType: isShare ? TargetType.POST : TargetType.SHARE,
      });
      setSelected(null);
      return;
    } else {
      // Chưa like thì like
      await react({
        targetId: rootId,
        targetType: isShare ? TargetType.POST : TargetType.SHARE,
        reactionType: ReactionType.LIKE,
      });
    }

    setSelected(reactionsUI.find((r) => r.type === ReactionType.LIKE)!);
  };

  const { openModal: openCommentModal } = useCommentModal();
  const { openModal: openCreateShareModal } = useCreateShareModal();

  return (
    <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-600 text-sm relative">
      <div
        className="relative flex-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button
          variant="ghost"
          size="lg"
          className="flex w-full items-center gap-1 hover:text-sky-500"
          onClick={handleQuickReact}
        >
          {selected ? (
            <span className="text-lg">
              {reactionsUI.find((r) => r.type === selected.type)?.emoji}
            </span>
          ) : (
            <ThumbsUp size={16} />
          )}
          <span className={cn(selected && `text-bold ${selected.color}`)}>
            {selected?.name || 'React'}
          </span>
        </Button>

        {showReactions && (
          <ReactionHoverPopup
            onSelect={handleSelect}
            selectedReaction={selected}
          />
        )}
      </div>

      {/* 💬 Comment */}
      <Button
        variant="ghost"
        size="lg"
        className="flex-1 items-center gap-1 hover:text-sky-500"
        onClick={() => {
          openCommentModal(rootId, rootType, data);
        }}
      >
        <MessageCircle size={16} /> <span>Comment</span>
      </Button>

      {/* 🔁 Share */}
      {isShare && (
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 items-center gap-1 hover:text-sky-500"
          onClick={() => {
            openCreateShareModal(data as PostSnapshotDTO);
          }}
        >
          <Share2 size={16} /> <span>Share</span>
        </Button>
      )}
    </div>
  );
}
