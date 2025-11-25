'use client';
import { SidebarCustom } from '@/components/side-bar-custom';
import { useAuth } from '@clerk/nextjs';
import { ChartColumn, ContactRound, UserCircle } from 'lucide-react';

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const {userId} = useAuth()
  return (
    <>
      <div className="grid grid-cols-4 w-full">
        <div className="w-1/4 h-full p-2 overflow-y-hidden fixed hidden sm:flex sm:flex-col justify-start ">
          <SidebarCustom
            items={[
              {
                label: 'Trang cá nhân',
                href: `/profile/${userId}`,
                icon: UserCircle,
              },
              {
                label: 'Bạn bè',
                href: '/friends',
                icon: ContactRound,
              },
              {
                label: 'Thống kê',
                href: '/dashboard',
                icon: ChartColumn,
              },
            ]}
          />
        </div>

        <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-2 px-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
};

export default NewsFeedLayout;
