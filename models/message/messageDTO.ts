import z from "zod";

export const MessageSchema = z.object({
  senderId: z.string(),
  content: z.string().max(2000, "Content exceeds maximum length of 2000 characters"),
  conversationId: z.string(),
  attachments: z
    .array(
      z.object({
        url: z.url(),
        mimeType: z.string().optional(),
        fileName: z.string().optional(),
        size: z.number().optional(),
        thumbnailUrl: z.url().optional(),
      })
    )
    .optional(),
  replyToId: z.string().optional(),
});

export type CreateMessageForm = z.infer<typeof MessageSchema>;

export interface MessageDTO {
  _id: string;
  senderId: string;
  content: string;
  conversationId: string;
  status: 'sent' | 'delivered' | 'read';
  seenBy: string[];
  reactionStats: ReactionStatsDTO
  attachments: AttachmentDTO[];
  replyTo?: MessageDTO;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentDTO {
  url: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface ReactionStatsDTO {
  [reaction: string]: number;
}