

import { UserPosts } from './_components/user-posts';


export default async function ProfilePage ({
  params
}: {
  params: Promise<{ userId: string }>;
})  {
  const { userId } = await params;
  return (
    <UserPosts userId={userId as string} />
  );
};

