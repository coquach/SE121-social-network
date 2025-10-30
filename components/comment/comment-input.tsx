'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Avatar } from '../avatar';

interface CommentInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
}

export const CommentInput = ({
  placeholder = 'Viết bình luận...',
  onSubmit,
}: CommentInputProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="flex items-start gap-2 w-full">
      <Avatar userId="current_user" />

      <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {value.trim() && (
          <button
            onClick={handleSubmit}
            className="text-sky-600 hover:text-sky-700 p-1"
          >
            <SendHorizonal size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
