import type { Metadata } from 'next';
import { getPost } from '@/lib/actions/social/post/post-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PostDetailView from './post-detail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  return {
    title: 'Bài viết',
    description: 'Chi tiết bài viết trên Sentimeta.',
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return null;
  }
  const qc = getQueryClient();

  qc.prefetchQuery({
    queryKey: ['post', postId],
    queryFn: async () => getPost(token, postId),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PostDetailView postId={postId} />
    </HydrationBoundary>
  );
}
