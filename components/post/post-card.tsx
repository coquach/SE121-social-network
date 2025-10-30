'use client';
import {
  Audience,
  MediaDTO,
  MediaType,
  ReactionType,
  RootType,
  TargetType,
} from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Skeleton } from '../ui/skeleton';
import PostActions from './post-action';
import PostContent from './post-content';
import PostHeader from './post-header';
import PostMedia from './post-media';
import PostStats from './post-stats';

const media: MediaDTO[] = [
  {
    type: MediaType.IMAGE,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  },
  {
    type: MediaType.IMAGE,
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  },
  {
    type: MediaType.VIDEO,
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    type: MediaType.IMAGE,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  },
];

const post: PostSnapshotDTO = {
  postId: 'post001',
  userId: 'user_post_001',
  createdAt: new Date(),
  content: 'Bài viết gốc này rất thú vị và đáng để chia sẻ! 🚀',
  mediaPreviews: media,
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
};

const content: string = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;

interface PostCardsProps {
  data?: PostSnapshotDTO;
}
export const PostCard = ({ data = post }: PostCardsProps) => {
  const router = useRouter();
  const goToPost = useCallback(() => {
    router.push(`/post/${data?.postId}`);
  }, [router, data?.postId]);


  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-8 space-y-4 w-full">
      <PostHeader
        userId="123"
        audience={Audience.PUBLIC}
        createdAt={new Date()}
      />
      <PostContent content={content} />
      <PostMedia media={media} onClick={goToPost} />
      <PostStats
        targetId={data.postId}
        targetType={TargetType.POST}
        stats={data.postStat}
        data={data}
        isShare
      />
      <PostActions reactType={ReactionType.HAHA} rootId={data.postId} rootType={RootType.POST} data={data} isShare />
    </div>
  );
};

PostCard.Skeleton = function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-8 space-y-4 w-full animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
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
        <Skeleton className="h-3 w-4/6" />
      </div>

      {/* Media preview */}
      <div className="grid grid-cols-2 gap-1">
        <Skeleton className="w-full h-48 rounded-lg" />
        <Skeleton className="w-full h-48 rounded-lg" />
      </div>
      {/* Stat */}
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
