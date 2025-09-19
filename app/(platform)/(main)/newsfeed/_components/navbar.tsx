import { Logo } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';

export const Navbar = () => {
  return (
    <nav className='fix z-50 top-0 w-full h-16 border-b shadow-sm bg-white flex items-center px-4'>
      <div className='w-full mx-auto flex items-center gap-x-4 justify-between'>
        <div className='hidden md:flex'>
          <Logo />
        </div>
        {/* Search bar */}
        <div className='flex-1 flex justify-center max-w-[300px] mx-auto'></div>
        <div className='self-end flex items-center'>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
