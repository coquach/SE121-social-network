'use client';

import { useState } from 'react';

interface PostContentProps {
  content?: string;
}

const MAX_LENGTH = 100;
export default function PostContent({ content }: PostContentProps) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;
  const isLong = content.length > MAX_LENGTH;
  const display = expanded ? content : content.slice(0, MAX_LENGTH);

  return (
    <div className="text-gray-800 whitespace-pre-line">
      {display}
      {isLong && !expanded && (
        <span
          onClick={() => setExpanded(true)}
          className="text-neutral-400 text-sm font-medium ml-1 hover:underline cursor-pointer"
        >
          Xem thêm
        </span>
      )}
    </div>
  );
}
