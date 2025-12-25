'use client';
import { SidebarCustom } from "@/components/side-bar-custom";
import { Sparkles, UserPlus, Users } from "lucide-react";


export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid grid-cols-4 w-full h-full">
        <div className="w-1/4 h-full p-2 overflow-y-hidden fixed space-y-4 hidden sm:flex sm:flex-col justify-start ">
          <div className="text-2xl font-bold text-sky-500 p-2 md:pr-2 ">
            Bạn bè
          </div>
          <SidebarCustom
            items={[
              {
                label: 'Danh sách bạn bè',
                href: `/friends`,
                icon: Users,
              },
              {
                label: 'Lời mời kết bạn',
                href: '/friends/requests',
                icon: UserPlus,
              },
              {
                label: 'Gợi ý kết bạn',
                href: '/friends/suggestions',
                icon: Sparkles,
              },
            ]}
          />
        </div>

        <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-3 px-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
