'use client';

import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import PostContent from './post-content';
import PostHeader from './post-header';
import PostMedia from './post-media';

interface SharedPostPreviewProps {
  post: PostSnapshotDTO
}

const SharedPostPreview = ({ post }: SharedPostPreviewProps) => {
  const router = useRouter();

  const goToPost = useCallback(() => {
    router.push(`/post/${post.postId}`);
  }, [router, post.postId]);

  return (
    <div className="border rounded-lg bg-neutral-50 p-4 space-y-3 hover:bg-neutral-100/50 transition">
      {/* Media (nếu có) */}
      {post.mediaPreviews?.length ? (
        <PostMedia media={post.mediaPreviews} onClick={goToPost} />
      ) : null}

      {/* Header */}
      <PostHeader
        userId={post.userId}
        audience={post.audience}
        createdAt={post.createdAt}
      />

      {/* Nội dung bài viết */}
      <PostContent content={post.content || ''} />
    </div>
  );
};

export default SharedPostPreview;
