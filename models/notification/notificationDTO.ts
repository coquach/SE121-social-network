export type NotificationPayload = {
  targetType?: string;
  targetId?: string;
  actorName?: string;
  actorAvatar?: string;
  content?: string;
  [key: string]: unknown;
};

export interface NotificationDTO {
  _id: string;
  requestId?: string;
  userId: string;
  type: string;
  message?: string;
  payload: NotificationPayload;
  channels?: string[];
  status: 'unread' | 'read';
  retries?: number;
  sendAt?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
