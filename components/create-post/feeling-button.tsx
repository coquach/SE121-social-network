'use client';

import { useRef } from 'react';
import { TbMoodPlus } from 'react-icons/tb';
import { FeelingPopover } from '@/components/feeling-hover-popup';
import { useCreatePostContext } from './context';

/**
 * FeelingButton - Button to open feeling/emotion selector
 */
export const CreatePostFeelingButton = () => {
  const { form, openFeeling, setOpenFeeling, selectedFeeling } = useCreatePostContext();
  const feelingButtonRef = useRef<HTMLButtonElement>(null!);

  return (
    <FeelingPopover
      open={openFeeling}
      onOpenChange={setOpenFeeling}
      selectedFeeling={selectedFeeling}
      onSelect={(f) => {
        form.setFieldValue('feeling', f?.type ?? undefined);
      }}
      side="top"
    >
      <button
        type="button"
        ref={feelingButtonRef}
        className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
        title="Cảm xúc"
      >
        <TbMoodPlus className="h-5 w-5 text-gray-600" />
      </button>
    </FeelingPopover>
  );
};
