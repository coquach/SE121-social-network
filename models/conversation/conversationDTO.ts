import z from 'zod';
import { AttachmentDTO, MessageDTO } from '../message/messageDTO';

export const ConversarionSchema = z.object({
  isGroup: z.boolean(),
  participants: z.array(z.string()).min(1, 'Participants cannot be empty'),
  admins: z.array(z.string()).optional(),
  groupName: z.string().optional(),
  groupAvatar: z
    .object({
      url: z.url(),
      publicId: z.string().optional(),
    })
    .optional(),
});

export type CreateConversationForm = z.infer<typeof ConversarionSchema>;

export const UpdateConversationSchema = ConversarionSchema.partial().extend({});

export type UpdateConversationForm = z.infer<typeof UpdateConversationSchema>;

export interface ConversationDTO {
  _id: string;
  isGroup: boolean;
  participants: string[];
  admins: string[];
  groupName?: string;
  groupAvatar?: AttachmentDTO;
  lastMessage: MessageDTO;
  createdAt: Date;
  updatedAt?: Date;
  lastSeenMessageId: Map<string, string>;
  hideFor?: string[];
}
