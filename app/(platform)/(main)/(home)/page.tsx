
import { CreatePost } from '../../../../components/create-post';
import { HomeFeed } from './home-feed';

const NewsFeedPage = () => {
  return (
    <>
      <div className="h-full w-full p-4 space-y-6">
        <CreatePost  />
        <HomeFeed />
      </div>
    </>
  );
};
export default NewsFeedPage;
