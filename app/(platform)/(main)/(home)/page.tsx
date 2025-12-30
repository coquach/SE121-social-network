import type { Metadata } from 'next';
import { CreatePost } from '../../../../components/create-post';
import { HomeFeed } from './home-feed';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Bảng tin của bạn trên Sentimeta.',
};

const NewsFeedPage = () => {
  return (
    <>
      <div className="h-full w-full p-4 space-y-6">
        <CreatePost />
        <HomeFeed />
      </div>
    </>
  );
};
export default NewsFeedPage;
