import { MessageDTO } from "../message/messageDTO";

export interface ConversationDTO {
  _id: string;
  isGroup: boolean;
  participants: string[];
  admins: string[];
  groupName?: string;
  groupAvatar?: string;
  lastMessage: MessageDTO;
  createdAt: Date;
  updatedAt?: Date;
  lastSeenMessageId?: Map<string, string>;
  hideFor?: string[];
}