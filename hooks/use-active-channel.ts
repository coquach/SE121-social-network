'use client';
import { useSocket } from '@/components/providers/socket-provider';
import { useActiveList } from '@/store/use-active-list';
import { useEffect } from 'react';

export const useActiveChannel = () => {
  const { add, remove, set } = useActiveList();
  const { chatSocket } = useSocket();

  useEffect(() => {
    if (!chatSocket) return;
    chatSocket.on('active_users', ({ userIds }: { userIds: string[]}) => {
      if (!Array.isArray(userIds)) return;
      set(userIds);
      console.log('Active users updated:', userIds);
    });
    chatSocket.on('user_online', ({ userId }: { userId: string }) => {
      add(userId);
      console.log('User online:', userId);
    });
    chatSocket.on('user_offline', ({ userId }: { userId: string }) => {
      remove(userId);
    });
    return () => {
      chatSocket.off('user_online');
      chatSocket.off('user_offline');
      chatSocket.off('active_users');
    };
  }, [chatSocket, add, remove, set]);
};
