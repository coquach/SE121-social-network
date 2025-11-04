'use client';

import { useMemo, useRef, useState } from 'react';

import { MessageCircle, ThumbsUp } from 'lucide-react';
import { ReactionType, TargetType } from '@/models/social/enums/social.enum';
import { CommentDTO, CommentStatDTO } from '@/models/social/comment/commentDTO';
import { formatCount } from '@/utils/format-count';
import { Avatar } from '../avatar';
import Image from 'next/image';
import { CommentInput } from './comment-input';
import { formatDistanceToNow } from 'date-fns';
import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { cn } from '@/lib/utils';
import { ReactionHoverPopup } from '../reaction-hover-popup';
import { getTopReactions } from '@/utils/get-top-reactions';
import { useReactionModal } from '@/store/use-post-modal';
import { Skeleton } from '../ui/skeleton';
import { useGetComments } from '@/hooks/user-comment-hook';
import { CldImage } from 'next-cloudinary';

interface CommentItemProps {
  comment: CommentDTO;
  onReply?: (parentId: string, text: string) => void;
  onReact?: (commentId: string, type: ReactionType) => void;
}

export const CommentItem = ({
  comment,
  onReply,
  onReact,
}: CommentItemProps) => {
  const { openModal } = useReactionModal();

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const { data: replyData, isLoading: loadingReplies } = useGetComments({
    parentId: comment.id,
  });
  const replies = useMemo(() => {
    return replyData ? replyData.pages.flatMap((p) => p.data) : [];
  }, [replyData]);


  const createAtFormat = useMemo(() => {
    if (!comment.createdAt) return null;
    return formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
    });
  }, [comment.createdAt]);

  const [showReactions, setShowReactions] = useState(false);
  const reaction = comment.reactedType
    ? reactionsUI.find((r) => r.type === comment.reactedType)
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

  const handleSelect = (reaction: Reaction | null) => {
    setSelected(reaction);
    setShowReactions(false);
  };

  const computed = useMemo(() => {
    if (!comment.commentStat) return null;
    const stats = comment.commentStat;
    const {
      reactions = 0,
      likes = 0,
      loves = 0,
      hahas = 0,
      wows = 0,
      angrys = 0,
      sads = 0,
    } = stats as CommentStatDTO;

    if (reactions === 0) return null;

    const { topReacts, total } = getTopReactions([
      { type: ReactionType.LIKE, count: likes },
      { type: ReactionType.LOVE, count: loves },
      { type: ReactionType.HAHA, count: hahas },
      { type: ReactionType.WOW, count: wows },
      { type: ReactionType.SAD, count: sads },
      { type: ReactionType.ANGRY, count: angrys },
    ]);

    return {
      total,
      reactions,
      topReacts,
    };
  }, [comment.commentStat]);

  return (
    <div className="flex flex-col gap-2">
      {/* main comment */}

      <div>
        <div className="bg-gray-100 px-3 py-2 rounded-2xl space-y-2">
          <Avatar userId={comment.userId} hasBorder showName />
          <p className="text-sm text-gray-800">{comment.content}</p>
          {comment.media.length > 0 && (
            <div className="mt-2">
              {comment.media.map((m, i) => (
                <CldImage
                  key={i}
                  src={m.url}
                  alt=""
                  width={200}
                  height={200}
                  className=" rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between w-full mt-1">
            {/* actions */}
            <div className="flex items-center gap-3 ml-2 text-xs text-gray-500 ">
              <span>{createAtFormat}</span>
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => {
                    onReact?.(comment.id, ReactionType.LIKE);
                    setSelected(null);
                  }}
                  className={`flex items-center cursor-pointer gap-1 ${
                    comment.reactedType === ReactionType.LIKE
                      ? 'text-sky-600 font-medium'
                      : 'hover:text-sky-600'
                  }`}
                >
                  <span
                    className={cn(
                      selected &&
                        `text-bold font-medium ${selected.color} underline`
                    )}
                  >
                    {selected?.name || 'Thích'}
                  </span>
                </button>
                {showReactions && (
                  <ReactionHoverPopup
                    onSelect={handleSelect}
                    selectedReaction={selected}
                  />
                )}
              </div>

              <button
                onClick={() => setShowReplyInput((prev) => !prev)}
                className="hover:text-sky-600 flex items-center gap-1"
              >
                <MessageCircle size={14} /> Phản hồi
              </button>
            </div>

            {/* stats */}
            {comment.commentStat.reactions > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-500 ml-2 mt-1">
                {computed && (
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      openModal(TargetType.COMMENT, comment.id);
                    }}
                  >
                    {computed.topReacts.length > 0 && (
                      <div className="flex -space-x-1">
                        {computed.topReacts.map((r, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              r!.color
                            } bg-transparent rounded-full transition-transform hover:scale-110`}
                            title={r!.name}
                          >
                            {r!.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    {computed.total > 0 && (
                      <span className=" text-gray-700 font-medium hover:underline">
                        {formatCount(computed.total)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {replies.length > 0 && !showReplies && (
        <button
          onClick={() => setShowReplies(true)}
          className="text-xs text-sky-600 font-medium mt-1 ml-2"
        >
          Xem {replies.length} phản hồi
        </button>
      )}

      {showReplies && (
        <div className="ml-12 mt-2 border-l-2 border-gray-200 pl-3 space-y-3">
          {loadingReplies ? (
            <CommentItem.Skeleton />
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onReact={onReact}
              />
            ))
          )}
        </div>
      )}

      {/* reply input */}
      {showReplyInput && (
        <div className="ml-12 mt-1">
          <CommentInput
            placeholder="Viết phản hồi..."
            onSubmit={(text) => {
              onReply?.(comment.id, text);
              setShowReplyInput(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

CommentItem.Skeleton = function CommentItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in-50">
      {/* Main comment */}
      <div className="bg-gray-100 px-3 py-2 rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 ml-12">
          <Skeleton className="h-3 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between w-full mt-2 ml-12">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Skeleton className="h-3 w-8 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
          <Skeleton className="h-3 w-8 rounded-md" />
        </div>
      </div>

      {/* Reply skeletons */}
      <div className="ml-12 mt-2 border-l-2 border-gray-200 pl-3 space-y-3">
        <div className="bg-gray-100 px-3 py-2 rounded-2xl space-y-2 w-[80%]">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-3 w-14 rounded-md" />
            </div>
          </div>
          <div className="space-y-2 ml-10">
            <Skeleton className="h-3 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
