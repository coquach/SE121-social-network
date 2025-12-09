'use client';

import { useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { useActiveList, PresenceStatus } from '@/store/use-active-list';

export const useActiveChannel = (userIds: string[]) => {
  const { upsert, remove } = useActiveList();
  const { chatSocket } = useSocket();

  useEffect(() => {
    if (!chatSocket) return;
    if (!Array.isArray(userIds) || userIds.length === 0) return;

    const targetIds = Array.from(new Set(userIds.filter(Boolean)));

    // subscribe
    chatSocket.emit('presence.subscribe', { userIds: targetIds });
    console.log('📡 presence.subscribe', targetIds);

    // snapshot ban đầu: Record<userId, { status, lastSeen }>
    const handleSnapshot = (
      payload: Record<string, { status: string; lastSeen: string | null }>
    ) => {
      Object.entries(payload).forEach(([userId, info]) => {
        if (!targetIds.includes(userId)) return;

        const normalizedStatus = info.status.toLowerCase() as PresenceStatus;

        upsert(userId, {
          status: normalizedStatus,
          lastSeen: info.lastSeen ?? null,
        });
      });

      console.log('📡 presence.snapshot', payload);
    };

    // realtime update: { userId, status, lastSeen }
    const handlePresenceUpdate = (payload: {
      userId: string;
      status: string;
      lastSeen: string | null;
    }) => {
      if (!targetIds.includes(payload.userId)) return;

      const normalizedStatus = payload.status.toLowerCase() as PresenceStatus;

      if (normalizedStatus === 'online' || normalizedStatus === 'away') {
        upsert(payload.userId, {
          status: normalizedStatus,
          lastSeen: payload.lastSeen ?? null,
        });
      } else {
        remove(payload.userId);
      }
    };

    chatSocket.on('presence.snapshot', handleSnapshot);
    chatSocket.on('presence.update', handlePresenceUpdate);

    return () => {
      chatSocket.emit('presence.unsubscribe', { userIds: targetIds });
      console.log('📡 presence.unsubscribe', targetIds);

      chatSocket.off('presence.snapshot', handleSnapshot);
      chatSocket.off('presence.update', handlePresenceUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSocket, upsert, remove, JSON.stringify(userIds)]);
};
