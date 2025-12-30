'use client';

import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PopupSide = 'top' | 'bottom';

interface ReactionHoverPopupProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (reaction: Reaction | null) => void;
  selectedReaction: Reaction | null;
  side?: PopupSide;
  children: ReactNode; // trigger
  onContentMouseEnter?: () => void;
  onContentMouseLeave?: () => void;
}

export const ReactionHoverPopup = ({
  open,
  onOpenChange,
  onSelect,
  selectedReaction,
  side = 'top',
  children,
  onContentMouseEnter,
  onContentMouseLeave,
}: ReactionHoverPopupProps) => {
  const [hovered, setHovered] = useState<Reaction | null>(null);
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align="center"
        sideOffset={10}
        onMouseEnter={onContentMouseEnter}
        onMouseLeave={onContentMouseLeave}
        className="w-auto p-0 border-0 bg-transparent shadow-none"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-full shadow-lg px-3 py-2 flex gap-2"
          >
            {reactionsUI.map((r) => {
              const isSelected = selectedReaction?.type === r.type;
              const isHovered = r.type === hovered?.type;
              return (
                <motion.button
                  key={r.type}
                  type="button"
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
      </PopoverContent>
    </Popover>
  );
};
