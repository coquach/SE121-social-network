
export interface MessageDTO {
  _id: string;
  senderId: string;
  content: string;
  conversationId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  seenBy: string[];
  deliveredBy: string[];
  reactions: ReactionDTO[];
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

export interface ReactionDTO {
  userId: string,
  emoji: string
}