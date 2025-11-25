'use client';
import { SearchInput } from '@/components/search-input';
import { SidebarCustom } from '@/components/side-bar-custom';
import { Globe2, UsersRound } from 'lucide-react';

export default function GrroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid grid-cols-4 w-full h-full">
        <div className="w-1/4 h-full p-2 overflow-y-hidden fixed space-y-4 hidden sm:flex sm:flex-col justify-start ">
          <div className="text-2xl font-bold text-sky-500 p-2 md:pr-2 ">
            Nhóm
          </div>
          <SidebarCustom
            items={[
              {
                label: 'Khám phá',
                href: `/groups/explore`,
                icon: Globe2,
              },
              {
                label: 'Nhóm của tôi',
                href: '/groups/my-groups',
                icon: UsersRound,
              },
            ]}
          />
        </div>

        <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-3 px-8 overflow-y-auto ">
          {children}
        </main>
      </div>
    </>
  );
}
