'use client';

import { NotificationCard } from '@/components/notification-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notification-hooks';
import { useAuth } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export const NotificationDropdown = () => {
  const { userId } = useAuth();
  const { notifications, isLoading, markRead, markReadAll, unreadCount } =
    useNotifications(userId as string);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative h-full flex items-center justify-center p-2 hover:bg-sky-500/10 rounded-md cursor-pointer">
          <Bell size={22} className="text-sky-400" fill="#38bdf8" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto bg-white shadow-xl rounded-xl border border-gray-200"
        align="end"
        sideOffset={8}
      >
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <span className="font-semibold text-sky-400">Thông báo</span>
          <Button
            size="sm"
            variant="outline"
            onClick={markReadAll}
            disabled={unreadCount === 0}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
        {/* Nội dung */}
        <div className="flex flex-col gap-2 p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <NotificationCard.Skeleton key={i} />
            ))
          ) : notifications.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Chưa có thông báo
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif._id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <NotificationCard notif={notif} onClick={markRead} />
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="px-3 py-2 border-t bg-gray-50">
            <Link href="/notifications">
              <Button variant="ghost" className="w-full">
                Xem tất cả
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
