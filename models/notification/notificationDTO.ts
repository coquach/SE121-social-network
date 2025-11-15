/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NotificationDTO {
  _id: string;
  requestId?: string;
  userId: string;
  type: string;
  message?: string;
  payload: any;
  channels: string[];
  status: 'unread' | 'read';
  retries: number;
  sendAt?: Date;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}