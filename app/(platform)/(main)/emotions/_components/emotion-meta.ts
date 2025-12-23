import { EmotionKey } from '@/models/emotion/emotionDTO';

export const EMOTION_KEYS: EmotionKey[] = [
  'joy',
  'sadness',
  'anger',
  'fear',
  'disgust',
  'surprise',
  'neutral',
];

export const emotionMeta: Record<
  EmotionKey,
  { label: string; emoji: string; color: string; bg: string }
> = {
  joy: {
    label: 'Vui vẻ',
    emoji: '😊',
    color: '#f59e0b',
    bg: 'bg-amber-50',
  },
  sadness: {
    label: 'Buồn',
    emoji: '😢',
    color: '#38bdf8',
    bg: 'bg-sky-50',
  },
  anger: {
    label: 'Tức giận',
    emoji: '😠',
    color: '#f97316',
    bg: 'bg-orange-50',
  },
  fear: {
    label: 'Lo lắng',
    emoji: '😨',
    color: '#a855f7',
    bg: 'bg-violet-50',
  },
  disgust: {
    label: 'Khó chịu',
    emoji: '🤢',
    color: '#22c55e',
    bg: 'bg-emerald-50',
  },
  surprise: {
    label: 'Ngạc nhiên',
    emoji: '😲',
    color: '#ec4899',
    bg: 'bg-pink-50',
  },
  neutral: {
    label: 'Bình thường',
    emoji: '😐',
    color: '#9ca3af',
    bg: 'bg-slate-50',
  },
};

export const getEmotionMeta = (value?: string | null) => {
  const key = (value ?? '').toLowerCase() as EmotionKey;
  if (key in emotionMeta) {
    return emotionMeta[key as EmotionKey];
  }
  return emotionMeta.neutral;
};

export const pickValue = (
  data: Record<string, number> | undefined,
  key: EmotionKey
) => {
  if (!data) return 0;
  return data[key] ?? data[key.toUpperCase()] ?? 0;
};
