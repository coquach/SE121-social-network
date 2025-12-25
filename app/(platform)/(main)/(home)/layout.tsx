'use client';

import { SidebarCustom } from '@/components/side-bar-custom';
import { useAuth } from '@clerk/nextjs';
import { ContactRound, Sparkles, UserCircle } from 'lucide-react';
import { ContactList } from './_components/contact-list';

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { userId } = useAuth();
  return (
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
              label: 'Nhật ký cảm xúc',
              href: '/emotions',
              icon: Sparkles,
            },
          ]}
        />
      </div>

      <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-2 px-8 overflow-y-auto">
        {children}
      </main>

      <div className="hidden lg:block lg:col-start-4 lg:col-span-1 p-4">
        <ContactList />
      </div>
    </div>
  );
};

export default NewsFeedLayout;
