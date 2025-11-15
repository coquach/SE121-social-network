'use client';

import { getNotifications } from '@/lib/actions/notification/notification-action';
import { CursorPageResponse } from '@/lib/cursor-pagination.dto';
import { Pagination } from '@/lib/pagination.dto';
import { NotificationDTO } from '@/models/notification/notificationDTO';
import { useNotificationStore } from '@/store/use-notification-store';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useNotifications(userId: string) {
  const { getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const {
    notifications,
    setNotifications,
    addNotification,
    markRead,
    markReadAll,
    unreadCount,
  } = useNotificationStore();

  // ==================== Fetch via React Query ====================
  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<CursorPageResponse<NotificationDTO>>({
      queryKey: ['notifications', userId],
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        return await getNotifications(token, {
          cursor: pageParam,
          limit: 10,
        } as Pagination);
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextCursor : undefined,
      initialPageParam: undefined,
      staleTime: 100_000,
      refetchOnWindowFocus: true,
    });

  // ==================== Sync query data vào Zustand ====================
  useEffect(() => {
    if (!data) return;
    const merged = data.pages.flatMap((p) => p.data || []);
    setNotifications(merged);
  }, [data, setNotifications]);

  // ==================== Socket realtime ====================
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const token = await getToken();
      if (!token) return;

      const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`, {
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => console.log('✅ WS connected', socket.id));
      socket.on('disconnect', () => console.log('❌ WS disconnected'));

      // Khi có notification mới
      socket.on('notification', (notif: NotificationDTO) => {
        addNotification(notif);
        refetch();
      });

      // Khi server báo mark read / mark all
      socket.on('mark_read', (id: string) => markRead(id));
      socket.on('mark_read_all', () => markReadAll());

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    })();
  }, [userId, getToken, addNotification, markRead, markReadAll, refetch]);

  // ==================== Action gửi về server ====================
  const handleMarkRead = async (id: string) => {
    markRead(id);
    const socket = socketRef.current;
    socket?.emit('mark_read', id);
  };

  const handleMarkReadAll = async () => {
    markReadAll();
    const socket = socketRef.current;
    socket?.emit('mark_read_all', userId);
  };

  return {
    notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    markRead: handleMarkRead,
    markReadAll: handleMarkReadAll,
    unreadCount,
  };
}
