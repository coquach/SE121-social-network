import { create } from 'zustand';
import { NotificationDTO } from '@/models/notification/notificationDTO';

interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;

  setNotifications: (notifs: NotificationDTO[]) => void;
  addNotification: (notif: NotificationDTO) => void;
  markRead: (id: string) => void;
  markReadAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifs) => {
    const unread = notifs.filter((n) => n.status !== 'read').length;
    set({ notifications: notifs, unreadCount: unread });
  },

  addNotification: (notif) => {
    const exists = get().notifications.some((n) => n._id === notif._id);
    if (exists) return;

    const newList = [notif, ...get().notifications];
    const unread = newList.filter((n) => n.status !== 'read').length;
    set({ notifications: newList as NotificationDTO[], unreadCount: unread });
  },

  markRead: (id) => {
    const newList = get().notifications.map((n) =>
      n._id === id ? { ...n, status: 'read' } : n
    );
    const unread = newList.filter((n) => n.status !== 'read').length;
    set({ notifications: newList as NotificationDTO[], unreadCount: unread });
  },

  markReadAll: () => {
    const newList = get().notifications.map((n) => ({
      ...n,
      status: 'read',
    }));
    set({ notifications: newList as NotificationDTO[], unreadCount: 0 });
  },
}));
