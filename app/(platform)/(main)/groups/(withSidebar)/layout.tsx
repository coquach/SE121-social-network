'use client';

import { SidebarCustom } from '@/components/side-bar-custom';
import { Globe2, Mail, PlusCircle, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { CreateGroupDialog } from './_components/create-group';

export default function GrroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  return (
    <>
      <CreateGroupDialog
        open={createGroupModalOpen}
        onOpenChange={setCreateGroupModalOpen}
      />
      <div className="grid grid-cols-4 w-full h-full">
        <div className="w-1/4 h-full p-2 overflow-y-hidden fixed gap-y-2 hidden sm:flex sm:flex-col justify-start ">
          <div className="flex items-center justify-between px-2">
            <p className="text-2xl font-bold text-sky-500 p-2 md:pr-2 ">Nhóm</p>

            <PlusCircle
              className="cursor-pointer text-sky-500"
              size={32}
              onClick={() => setCreateGroupModalOpen(true)}
            />
          </div>
          <hr />
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
              {
                label: 'Lời mời',
                href: '/groups/invites',
                icon: Mail,
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
