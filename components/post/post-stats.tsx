'use client';

import {
  ReactionType,
  RootType,
  TargetType,
} from '@/models/social/enums/social.enum';
import { MessageCircle, Repeat2 } from 'lucide-react';
import { useMemo } from 'react';

import { PostSnapshotDTO, PostStatDTO } from '@/models/social/post/postDTO';
import {
  SharePostSnapshotDTO,
  SharePostStatDTO,
} from '@/models/social/post/sharePostDTO';
import { useCommentModal, useReactionModal, useShareListModal } from '@/store/use-post-modal';
import { formatCount } from '@/utils/format-count';
import { getTopReactions } from '@/utils/get-top-reactions';

interface PostStatsProps {
  targetId: string;
  targetType: TargetType;
  stats?: PostStatDTO | SharePostStatDTO;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean; // 👈 để phân biệt loại
}

export default function PostStats({
  targetId,
  targetType,
  stats,
  data,
  isShare = false,
}: PostStatsProps) {
  const reactionModal = useReactionModal();
  const commentModal = useCommentModal();
  const shareListModal = useShareListModal();
  const computed = useMemo(() => {
    if (!stats) return null;

    const {
      reactions = 0,
      likes = 0,
      loves = 0,
      hahas = 0,
      wows = 0,
      angrys = 0,
      sads = 0,
      comments = 0,
    } = stats as SharePostStatDTO;

    // Nếu có `shares` (PostStatDTO) thì lấy, còn share bài thì không
    const shares = (stats as PostStatDTO).shares ?? 0;

    if (reactions === 0 && comments === 0 && (!shares || shares === 0))
      return null;

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
      comments,
      shares,
    };
  }, [stats]);

  if (!computed) return null;

  const { topReacts, reactions: total, comments, shares } = computed;

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      {/* Reactions */}
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => {
          console.log('click reactions');
          reactionModal.openModal(targetType, targetId);
        }}
      >
        {topReacts.length > 0 && (
          <div className="flex -space-x-1">
            {topReacts.map((r, i) => (
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
        {total > 0 && (
          <span className="ml-1 text-gray-700 font-medium hover:underline">
            {formatCount(total)}
          </span>
        )}
      </div>

      {/* Comments + Shares */}
      <div className="flex items-center gap-4">
        {comments > 0 && (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-sky-600 transition"
            onClick={() =>
              commentModal.openModal(
                targetId,
                isShare ? RootType.POST : RootType.SHARE,
                data
              )
            }
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatCount(comments)}</span>
          </div>
        )}

        {isShare &&
          shares > 0 && ( 
            <div className="flex items-center gap-1 cursor-pointer hover:text-sky-600 transition" onClick={() => {
              shareListModal.openModal(targetId);
            }}>
              <Repeat2 className="w-4 h-4" />
              <span>{formatCount(shares)}</span>
            </div>
          )}
      </div>
    </div>
  );
}
