'use client';

import { Search } from 'lucide-react';
import clsx from 'clsx';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
}) => {
  return (
    <div className={clsx('relative w-full', className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-1 focus:ring-sky-400 text-sm"
      />
    </div>
  );
};
