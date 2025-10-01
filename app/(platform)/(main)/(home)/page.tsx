'use client';

import { useAuth } from '@clerk/nextjs';
import { CreatePost } from './_components/create-post';

const NewsFeedPage = () => {
  const { userId } = useAuth();
  return (
    <>
      {userId ? (
        <div className="min-h-screen w-full p-4">
          <CreatePost userId={userId} />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};
export default NewsFeedPage;
