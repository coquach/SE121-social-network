import { Logo } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { Search } from './search';
import { Tabs } from './tabs';
import { Bell } from 'lucide-react';
import { ThemeSwitcher } from './theme-switcher';

export const Navbar = () => {
  return (
    <nav className='fix z-50 top-0 w-full h-16 border-b shadow-sm bg-white flex items-center px-4'>
      <div className='grid grid-cols-4 w-full'>
        <div className='col-span-1 h-full  p-2 md:pr-2 flex items-center gap-2'>
          <Logo />

          {/* Search bar */}
          <Search />
        </div>

        <Tabs />
        <div className='ml-auto col-span-3 md:col-span-1'>
          <div className='flex items-center ml-auto gap-2 p-2 '>
            <div className='h-full flex items-center'>
            <ThemeSwitcher size='sm'/>
            </div>
            <div className=' h-full flex  items-center justify-center p-4 hover:bg-sky-500/10 rounded-md'>
              <Bell size={22} color='#00bcff' />
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
