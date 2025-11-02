'use client';

import { useAuth } from '@clerk/nextjs';
import { CreatePost } from './_components/create-post';
import { PostCard } from '@/components/post/post-card';
import { HomeFeed } from './home-feed';
import { ShareCard } from '@/components/post/share-post';

const NewsFeedPage = () => {
  const { userId } = useAuth();
  return (
    <>
      <div className="h-full w-full p-4 space-y-6">
        <CreatePost userId={userId as string} />
        <HomeFeed />
      </div>
    </>
  );
};
export default NewsFeedPage;
