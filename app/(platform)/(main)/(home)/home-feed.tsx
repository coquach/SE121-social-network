import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleUser, TrendingUp } from 'lucide-react';
import { TrendingFeed } from './_components/trending-feed';
import { PersonalFeed } from './_components/personal-feed';

enum HomeFeedTab {
  MYFEED = 'Cá nhân',
  TRENDING = 'Xu hướng',
}

export const HomeFeed = () => {
  return (
    <section>
      <Tabs defaultValue={HomeFeedTab.TRENDING} className="w-full">
        <TabsList className="w-full grid grid-cols-2  bg-gray-100 p-y-5 rounded-xl h-15">
          <TabsTrigger
            value={HomeFeedTab.TRENDING}
            className="w-full text-lg font-semibold rounded-lg text-neutral-400 hover:text-sky-400
                 data-[state=active]:bg-sky-500 data-[state=active]:shadow
                 data-[state=active]:text-white transition"
          >
            <TrendingUp size={16} />
            {HomeFeedTab.TRENDING}
          </TabsTrigger>
          <TabsTrigger
            value={HomeFeedTab.MYFEED}
            className="w-full text-lg font-semibold rounded-lg text-neutral-400 hover:text-sky-400
                 data-[state=active]:bg-sky-500 data-[state=active]:shadow
                 data-[state=active]:text-white transition flex gap-2 justify-center items-center"
          >
            <CircleUser size={16} />
            {HomeFeedTab.MYFEED}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value={HomeFeedTab.TRENDING}
          className="mt-6 text-gray-700"
        >
          <TrendingFeed />
        </TabsContent>
        <TabsContent value={HomeFeedTab.MYFEED} className="mt-6 text-gray-700">
          <PersonalFeed />
        </TabsContent>
      </Tabs>
    </section>
  );
};
