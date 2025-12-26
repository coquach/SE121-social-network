'use client';

import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface ReactionHoverPopupProps {
  onSelect: (reaction: Reaction | null) => void;
  selectedReaction: Reaction | null;
}

export const ReactionHoverPopup = ({
  onSelect,
  selectedReaction,
}: ReactionHoverPopupProps) => {
  const [hovered, setHovered] = useState<Reaction | null>(null);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-3 py-2 flex gap-2 z-10"
      >
        {reactionsUI.map((r) => {
          const isSelected = selectedReaction?.type === r.type;
          const isHovered = r.type === hovered?.type;
          return (
            <motion.button
              key={r.type}
              whileHover={{ scale: 1.3 }}
              onMouseEnter={() => setHovered(r)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(r)}
              className={`
                text-xl cursor-pointer 
                ${isSelected ? 'scale-125 bg-gray-200 rounded-full' : ''}
                ${isHovered && !isSelected ? 'scale-110' : ''}
              `}
              title={r.name}
            >
              {r.emoji}
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
