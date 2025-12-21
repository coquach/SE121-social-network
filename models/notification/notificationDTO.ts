export interface NotificationDTO {
  _id: string;
  requestId?: string;
  userId: string;
  type: string;
  message?: string;
  payload: unknown;
  channels: string[];
  status: 'unread' | 'read';
  retries: number;
  sendAt?: Date;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}