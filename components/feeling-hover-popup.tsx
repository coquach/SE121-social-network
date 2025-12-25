'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { feelingsUI, FeelingUI } from '@/lib/types/feeling';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PopupSide = 'top' | 'bottom';

export function FeelingPopover({
  open,
  onOpenChange,
  selectedFeeling,
  onSelect,
  side = 'top',
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedFeeling: FeelingUI | null;
  onSelect: (f: FeelingUI | null) => void;
  side?: PopupSide;
  children: React.ReactNode; // trigger button
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        side={side}
        align="center" // ✅ luôn ở giữa nút
        sideOffset={10}
        className="w-auto p-0 border-0 bg-transparent shadow-none"
      >
        <div
          data-feeling-popup="true"
          className="rounded-full border border-sky-100 bg-white/95 shadow-lg px-3 py-3 flex gap-1 backdrop-blur"
        >
          {feelingsUI.map((f) => {
            const isSelected = selectedFeeling?.type === f.type;

            return (
              <motion.button
                key={f.type}
                type="button"
                whileHover={{ scale: 1.2 }}
                onClick={() => {
                  onSelect(isSelected ? null : f);
                  onOpenChange(false);
                }}
                className={[
                  'text-xl cursor-pointer rounded-full px-2.5 py-1.5 transition',
                  f.color,
                  isSelected ? 'bg-sky-100 ring-1 ring-sky-200' : '',
                ].join(' ')}
                title={f.name}
              >
                {f.emoji}
              </motion.button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
