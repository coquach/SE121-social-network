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

interface CommentItemProps {
  comment: CommentDTO;
  replies?: CommentDTO[];
  depth?: number;
  onReply?: (parentId: string, text: string) => void;
  onReact?: (commentId: string, type: ReactionType) => void;
}

export const CommentItem = ({
  comment,
  replies = [],
  depth = 0,
  onReply,
  onReact,
}: CommentItemProps) => {

  const { openModal} = useReactionModal();

  const [showReplyInput, setShowReplyInput] = useState(false);

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
                <Image
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
                  <ReactionHoverPopup onSelect={handleSelect} selectedReaction={selected} />
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

      {/* replies */}
      {replies.length > 0 && (
        <div className="ml-12 mt-2 border-l-2 border-gray-200 pl-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
};
