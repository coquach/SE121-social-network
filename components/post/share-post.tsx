'use client';

import { Audience, MediaType, ReactionType, RootType, TargetType } from '@/models/social/enums/social.enum';
import PostActions from './post-action';
import PostContent from './post-content';
import PostHeader from './post-header';
;

import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { Skeleton } from '../ui/skeleton';
import PostStats from './post-stats';
import SharedPostPreview from './share-post-review';

// 🧩 Mock data để demo
const mockShare: SharePostSnapshotDTO = {
  shareId: 'share123',
  userId: 'user_share_001',
  createdAt: new Date(),
  reactedType: ReactionType.LIKE,
  content: 'Mình thấy bài viết này rất hay, mọi người cùng xem nhé! 😊',
  post: {
    postId: 'post001',
    userId: 'user_post_001',
    createdAt: new Date(),
    content: 'Bài viết gốc này rất thú vị và đáng để chia sẻ! 🚀',

    mediaPreviews: [
      {
        type: MediaType.IMAGE,
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      },
      {
        type: MediaType.VIDEO,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      },
    ],
    audience: Audience.PUBLIC,
    postStat: {
      reactions: 15,
      likes: 8,
      loves: 4,
      hahas: 1,
      wows: 1,
      angrys: 1,
      sads: 0,
      comments: 3,
      shares: 2,
    },
  },
  shareStat: {
    reactions: 4,
    likes: 3,
    loves: 1,
    hahas: 0,
    wows: 0,
    angrys: 0,
    sads: 0,
    comments: 2,
  },
};


export const ShareCard = ({
  data = mockShare,
}: {
  data?: SharePostSnapshotDTO;
}) => {

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 w-full">
      {/* Header của người share */}
      <PostHeader userId={data.userId} audience={Audience.PUBLIC} createdAt={data.createdAt} isShared />
      <PostContent content={data.content || ''} />

      {/* Bài post được chia sẻ */}
      {data.post && (
        <SharedPostPreview post={data.post} />
      )}

      {/* Stats */}

        <PostStats stats={data.shareStat} data={data} targetId={data.shareId} targetType={TargetType.SHARE} />
      {/* Thanh action của share (react, cmt, share lại) */}
      <PostActions reactType={data.reactedType ?? ReactionType.LIKE} rootId={data.shareId} rootType={RootType.SHARE} data={data} />
    </div>
  );
};

ShareCard.Skeleton = function ShareCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 w-full animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* Shared Post Preview */}
      <div className="border rounded-lg bg-neutral-50 p-4 space-y-3">
        {/* 🖼Media trước */}
        <Skeleton className="w-full h-48 rounded-md" />

        {/*  Header người đăng bài gốc */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>

        {/*  Content bài post gốc */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-4 rounded" />
        </div>

        {/* Comments + Shares */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};  