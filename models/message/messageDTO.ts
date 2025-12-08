
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