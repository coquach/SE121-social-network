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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactionHoverPopup } from '../reaction-hover-popup';
import { Button } from '../ui/button';

interface PostActionsProps {
  reactType?: ReactionType;
  rootType: RootType;
  rootId: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean;
  disableCommentModal?: boolean;
}

export default function PostActions({
  reactType,
  rootType,
  rootId,
  data,
  isShare,
  disableCommentModal = false,
}: PostActionsProps) {
  const { mutateAsync: react } = useReact(rootId);
  const { mutateAsync: disReact } = useDisReact(rootId);

  const { openModal: openCommentModal } = useCommentModal();
  const { openModal: openCreateShareModal } = useCreateShareModal();

  const targetType: TargetType = useMemo(() => {
    return rootType === RootType.POST ? TargetType.POST : TargetType.SHARE;
  }, [rootType]);

  const reactionFromProp = useMemo(() => {
    return reactType
      ? reactionsUI.find((r) => r.type === reactType) ?? null
      : null;
  }, [reactType]);

  const [selected, setSelected] = useState<Reaction | null>(reactionFromProp);
  const [showReactions, setShowReactions] = useState(false);

  // Sync selected khi reactType prop đổi (WS update/refresh query)
  useEffect(() => {
    setSelected(reactionFromProp);
  }, [reactionFromProp]);

  // Hover delay (tránh nhấp nháy + cleanup khi unmount)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const openReactions = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = null;
    setShowReactions(true);
  }, []);

  const closeReactions = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowReactions(false), 150);
  }, []);

  const commitReact = useCallback(
    async (next: Reaction | null, prev: Reaction | null) => {
      try {
        if (!next) {
          await disReact({ targetId: rootId, targetType });
        } else {
          await react({
            targetId: rootId,
            targetType,
            reactionType: next.type,
          });
        }
      } catch (e) {
        console.error('Reaction failed:', e);
        setSelected(prev); // rollback UI
      }
    },
    [disReact, react, rootId, targetType]
  );

  const handleSelect = useCallback(
    async (picked: Reaction | null) => {
      setShowReactions(false);
      if (!picked) return;

      const prev = selected;
      const isSame = prev?.type === picked.type;
      const next = isSame ? null : picked;

      setSelected(next);
      await commitReact(next, prev);
    },
    [commitReact, selected]
  );



  const handleQuickReact = useCallback(async () => {
    const prev = selected;

    // toggle LIKE nhanh
    const like = reactionsUI.find((r) => r.type === ReactionType.LIKE) ?? null;
    const next = prev ? null : like;

    setSelected(next);
    await commitReact(next, prev);
  }, [commitReact, selected]);

  const label = selected?.name ?? 'React';
  const emoji = selected
    ? reactionsUI.find((r) => r.type === selected.type)?.emoji
    : null;

    const handleOpenComment = useCallback(() => {
      if (disableCommentModal) return;
      openCommentModal(rootId, rootType, data.userId ,data);
    }, [disableCommentModal, openCommentModal, rootId, rootType, data]);

  return (
    <div className="relative border-t border-gray-100 pt-2">
      <div className="flex items-stretch text-sm text-gray-600">
        {/* React */}
        <ReactionHoverPopup
          open={showReactions}
          onOpenChange={setShowReactions}
          onSelect={handleSelect}
          selectedReaction={selected}
          onContentMouseEnter={openReactions}
          onContentMouseLeave={closeReactions}
          side="top"
        >
          <div
            className="relative flex-1"
            onMouseEnter={openReactions}
            onMouseLeave={closeReactions}
          >
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={cn(
                'w-full justify-center gap-2 rounded-lg',
                'hover:bg-gray-50 hover:text-sky-600',
                selected && 'text-sky-700'
              )}
              onClick={handleQuickReact}
            >
              {emoji ? (
                <span className="text-lg leading-none">{emoji}</span>
              ) : (
                <ThumbsUp size={16} />
              )}
              <span className={cn(selected?.color, selected && 'font-semibold')}>
                {label}
              </span>
            </Button>
          </div>
        </ReactionHoverPopup>

        {/* divider */}
        <div className="w-px bg-gray-100 mx-1" />

        {/* Comment */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="flex-1 justify-center gap-2 rounded-lg hover:bg-gray-50 hover:text-sky-600"
          onClick={handleOpenComment}
        >
          <MessageCircle size={16} />
          <span>Comment</span>
        </Button>

        {/* divider */}
        {isShare && rootType === RootType.POST && (
          <>
            <div className="w-px bg-gray-100 mx-1" />
            {/* Share chỉ hợp lý cho Post gốc */}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 justify-center gap-2 rounded-lg hover:bg-gray-50 hover:text-sky-600"
              onClick={() => openCreateShareModal(data as PostSnapshotDTO)}
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
