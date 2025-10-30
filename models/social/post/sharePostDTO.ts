import z from 'zod';
import { PostDTO, PostSnapshotDTO } from './postDTO';
import { ReactionType } from '../enums/social.enum';

export const SharePostSchema = z.object({
  groupId: z.string().optional(),
  content: z
    .string()
    .min(1, 'Content cannot empty')
    .max(2000, 'Content is too long'),
});

export type CreateSharePostForm = z.infer<typeof SharePostSchema>;

export const UpdateSharePostSchema = SharePostSchema.partial().extend({});

export type UpdateSharePostForm = z.infer<typeof UpdateSharePostSchema>;

export interface SharePostStatDTO {
  reactions: number;
  likes: number;
  loves: number;
  hahas: number;
  wows: number;
  angrys: number;
  sads: number;
  comments: number;
}

export interface SharePostDTO {
  id: string;
  userId: string;
  content: string;
  post: PostDTO;
  createdAt: Date;
  updatedAt: Date;
  sharePostStat: SharePostStatDTO;
  reactedType?: ReactionType;
}

export interface SharePostSnapshotDTO {
  shareId: string;
  userId: string;
  content?: string;
  post: PostSnapshotDTO;
  createdAt: Date;
  reactedType?: ReactionType;
  shareStat?: SharePostStatDTO;
}
