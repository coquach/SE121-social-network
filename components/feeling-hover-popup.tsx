'use client';

import { feelingsUI, FeelingUI } from '@/lib/types/feeling';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface FeelingHoverPopupProps {
  onSelect: (feeling: FeelingUI | null) => void;
  selectedFeeling: FeelingUI | null;
}

export const FeelingHoverPopup = ({
  onSelect,
  selectedFeeling,
}: FeelingHoverPopupProps) => {
  const [hovered, setHovered] = useState<FeelingUI | null>(null);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-2 py-3 flex gap-1 z-100"
      >
        {feelingsUI.map((f) => {
          const isSelected = selectedFeeling?.type === f.type;
          const isHovered = hovered?.type === f.type;

          return (
            <motion.button
              key={f.type}
              type="button"
              whileHover={{ scale: 1.3 }}
              onMouseEnter={() => setHovered(f)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (selectedFeeling?.type === f.type) {
                  onSelect(null);
                  return;
                }
                onSelect(f);
              }}
              className={[
                'text-xl cursor-pointer rounded-full px-2 py-1',
                isSelected ? 'bg-gray-200 scale-125' : '',
                isHovered && !isSelected ? 'scale-110' : '',
              ].join(' ')}
              title={f.name}
            >
              {f.emoji}
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
