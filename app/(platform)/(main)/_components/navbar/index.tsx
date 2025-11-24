'use client';
import { Logo } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';

import { Bell } from 'lucide-react';
import { Search } from './search';
import { Tabs } from './tabs';
import { ThemeSwitcher } from './theme-switcher';
import { NotificationDropdown } from './notification-dropdown';
import { usePathname } from 'next/navigation';
import { MessageDropdown } from './messages-dropdown';

export const Navbar = () => {
   const pathname = usePathname();

   const showMessageDropdown = !pathname?.startsWith('/conversations');
  return (
    <nav className="fixed z-50 top-0 left-0 w-screen  h-16 border-b shadow-sm bg-white flex items-center px-4">
      <div className="grid grid-cols-4 w-full">
        <div className="col-span-1 h-full  p-2 md:pr-2 flex items-center gap-2">
          <Logo />

          {/* Search bar */}
          <Search />
        </div>

        <Tabs />

        <div className="ml-auto col-span-3 md:col-span-1">
          <div className="flex items-center ml-auto gap-4 p-2 ">
            <div className="h-full flex items-center">
              <ThemeSwitcher size="sm" />
            </div>
            {showMessageDropdown && (
              <div className="h-full">
                <MessageDropdown />
              </div>
            )}
            <div className="h-full py-3">
              <NotificationDropdown />
            </div>

            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
