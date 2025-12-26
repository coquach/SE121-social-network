import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Repeat2, User } from 'lucide-react';
import { UserPosts } from './_components/user-posts';
import { UserSharePosts } from './_components/share-post';


enum ProfileFeedTab {
  USERFEED = 'Bài đăng',
  SHARED = 'Đã chia sẻ',
}

export const ProfileFeed = ({ userId }: { userId: string }) => {
  return (
    <section>
      <Tabs defaultValue={ProfileFeedTab.USERFEED} className="w-full">
        <TabsList className="w-full grid grid-cols-2  bg-gray-100 p-y-5 rounded-xl h-15">
          <TabsTrigger
            value={ProfileFeedTab.USERFEED}
            className="w-full text-lg font-semibold rounded-lg text-neutral-400 hover:text-sky-400
                 data-[state=active]:bg-sky-500 data-[state=active]:shadow
                 data-[state=active]:text-white transition"
          >
            <User size={16} />
            {ProfileFeedTab.USERFEED}
          </TabsTrigger>
          <TabsTrigger
            value={ProfileFeedTab.SHARED}
            className="w-full text-lg font-semibold rounded-lg text-neutral-400 hover:text-sky-400
                 data-[state=active]:bg-sky-500 data-[state=active]:shadow
                 data-[state=active]:text-white transition flex gap-2 justify-center items-center"
          >
            <Repeat2 size={16} />
            {ProfileFeedTab.SHARED}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value={ProfileFeedTab.USERFEED}
          className="mt-6 text-gray-700"
        >
          <UserPosts userId={userId} />
        </TabsContent>
        <TabsContent
          value={ProfileFeedTab.SHARED}
          className="mt-6 text-gray-700"
        >
          <UserSharePosts userId={userId} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
