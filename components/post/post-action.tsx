'use client';

import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { cn } from '@/lib/utils';
import { ReactionType } from '@/models/social/enums/social.enum';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface PostActionsProps {
  reactType?: ReactionType;
  isShare?: boolean;
}

export default function PostActions({ reactType, isShare }: PostActionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const reaction = reactType
    ? reactionsUI.find((r) => r.type === reactType)
    : null;

  const [selected, setSelected] = useState<Reaction | null>(reaction ?? null);

  const handleSelect = (reaction: Reaction) => {
    setSelected(reaction);
    setShowReactions(false);
  };

  return (
    <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-600 text-sm relative">
      <div
        className="relative flex-1"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        <Button
          variant="ghost"
          size="lg"
          className="flex w-full items-center gap-1 hover:text-sky-500"
          onClick={() => {
            setSelected(null);
          }}
        >
          {selected ? (
            <span className="text-lg">
              {reactionsUI.find((r) => r.type === selected.type)?.emoji}
            </span>
          ) : (
            <ThumbsUp size={16} />
          )}
          <span className={cn(selected && `text-bold ${selected.color}`)}>
            {selected?.name || 'React'}
          </span>
        </Button>

        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-3 py-2 flex gap-2 z-10"
            >
              {reactionsUI.map((r) => (
                <motion.button
                  key={r.name}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => handleSelect(r)}
                  className="text-xl cursor-pointer text-"
                  title={r.name}
                >
                  {r.emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 💬 Comment */}
      <Button
        variant="ghost"
        size="lg"
        className="flex-1 items-center gap-1 hover:text-sky-500"
      >
        <MessageCircle size={16} /> <span>Comment</span>
      </Button>

      {/* 🔁 Share */}
      {isShare && (
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 items-center gap-1 hover:text-sky-500"
        >
          <Share2 size={16} /> <span>Share</span>
        </Button>
      )}
    </div>
  );
}
