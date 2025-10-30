import z from "zod";
import { MediaDTO, MediaType, ReactionType, RootType } from "../enums/social.enum";
import React from "react";

export const CommentSchema = z.object({
  rootId: z.uuid(),
  rootType: z.enum(RootType),
  parentId: z.uuid().optional(),
  content: z
    .string()
    .min(1, 'Content cannot empty')
    .max(1000, 'Content is too long'),
  media: z
      .array(
        z.object({
          type: z.enum(MediaType),
          file: z.instanceof(File),
        })
      )
      .optional(),
});

export type CreateCommentForm = z.infer<typeof CommentSchema>

export const UpdateCommentSchema = CommentSchema.partial().extend({

});

export type UpdateCommentForm = z.infer<typeof UpdateCommentSchema>;


export interface CommentStatDTO  {
  reactions: number,
  likes: number,
  loves: number,
  hahas: number,
  wows: number,
  angrys: number,
  sads: number,
  replies: number
}

export interface CommentDTO {
  id: string,
  userId: string,
  rootId: string,
  rootType: RootType,
  parentId?: string,
  content: string,
  media: MediaDTO[],
  createdAt: Date,
  updatedAt: Date,
  isOwner: boolean,
  reactedType?: ReactionType,
  commentStat: CommentStatDTO
}