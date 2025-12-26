import { ReactionType } from '@/models/social/enums/social.enum';

export interface Reaction {
  type: ReactionType;
  name: string;
  emoji: string;
  color: string;
}
export const reactionsUI: Reaction[] = [
  { type: ReactionType.LIKE, name: 'Like', emoji: '👍', color: 'text-blue-500' },
  { type: ReactionType.LOVE, name: 'Love', emoji: '❤️', color: 'text-red-500' },
  { type: ReactionType.HAHA, name: 'Haha', emoji: '😂', color: 'text-yellow-500' },
  { type: ReactionType.WOW, name: 'Wow', emoji: '😮', color: 'text-yellow-400' },
  { type: ReactionType.SAD, name: 'Sad', emoji: '😢', color: 'text-blue-400' },
  { type: ReactionType.ANGRY, name: 'Angry', emoji: '😡', color: 'text-red-600' },
];
