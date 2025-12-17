import { Emotion } from '@/models/social/enums/social.enum';

export interface FeelingUI {
  type: Emotion;
  name: string;
  emoji: string;
  color: string; // nếu bà muốn dùng tailwind class
}

export const feelingsUI: FeelingUI[] = [
  { type: Emotion.JOY, name: 'Vui vẻ', emoji: '😊', color: 'text-yellow-500' },
  { type: Emotion.SADNESS, name: 'Buồn', emoji: '😢', color: 'text-blue-400' },
  { type: Emotion.ANGER, name: 'Tức giận', emoji: '😡', color: 'text-red-600' },
  { type: Emotion.FEAR, name: 'Lo sợ', emoji: '😨', color: 'text-purple-500' },
  {
    type: Emotion.DISGUST,
    name: 'Khó chịu',
    emoji: '🤢',
    color: 'text-green-600',
  },
  {
    type: Emotion.SURPRISE,
    name: 'Bất ngờ',
    emoji: '😮',
    color: 'text-yellow-400',
  },
  {
    type: Emotion.NEUTRAL,
    name: 'Bình thường',
    emoji: '🙂',
    color: 'text-gray-500',
  },
];
