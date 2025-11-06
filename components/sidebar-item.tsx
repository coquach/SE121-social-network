'use client';

import { LucideIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils'; // tiện cho class merge, nếu bạn chưa có thì thêm vào utils

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
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    if (onClick) return onClick();
    if (href) router.push(href);
  }, [router, onClick, href]);

  // Kiểm tra đường dẫn hiện tại có khớp không
  const isActive = pathname === href;

  return (
    <div onClick={handleClick} className="hidden sm:flex items-center">
      {/* Icon - phiên bản mobile */}
      <div
        className={cn(
          'relative rounded-full h-14 flex items-center justify-center p-4 hover:bg-slate-100 cursor-pointer sm:hidden transition',
          isActive && 'bg-slate-200'
        )}
      >
        {Icon && <Icon size={26} color={isActive ? '#007bff' : '#00bcff'} />}
      </div>

      {/* Full item - phiên bản desktop */}
      <div
        className={cn(
          'relative w-full hidden sm:flex items-center gap-4 p-4 rounded-md hover:bg-slate-100 cursor-pointer transition',
          isActive && 'bg-slate-200 text-sky-600 font-semibold'
        )}
      >
        {Icon && <Icon size={24} color={isActive ? '#007bff' : '#00bcff'} />}
        <p className="hidden sm:flex sm:flex-1 text-sm">{label}</p>
      </div>
    </div>
  );
};
