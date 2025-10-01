'use client'
import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface SidebarItemProps {
  label?: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const SidebarItem = ({
  label,
  href,
  icon: Icon,
  onClick,
}: SidebarItemProps) => {
  const router = useRouter();
  const handleClick = useCallback(() => {
    if (onClick) {
      return onClick();
    }
    if (href) {
      router.push(href);
    }
  }, [router, onClick, href]);

  return (
    <div onClick={handleClick} className='flex items-center '>
      <div className=' relative rounded-full h-14 flex item-centers justify-center p-4 hover:bg-slate-100  cursor-pointer sm:hidden transition '>

        {Icon && <Icon size={26} color='#00bcff' />}
      </div>
      <div className='relative w-full hidden sm:flex items-center gap-4 p-4 rounded-md hover:bg-slate-100  cursor-pointer'>
        {Icon && <Icon size={24} color='#00bcff' />}
        <p className='hidden sm:flex sm:flex-1 font-bold text-neutral-500 text-sm'>
          {label}
        </p>
      </div>
    </div>
  );
};
