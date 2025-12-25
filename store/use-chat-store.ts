// stores/reply-store.ts
import { create } from 'zustand';
import { MessageDTO } from '@/models/message/messageDTO';

interface ReplyState {
  replyTo: MessageDTO | null;
  setReplyTo: (msg: MessageDTO | null) => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replyTo: null,
  setReplyTo: (msg) => set({ replyTo: msg }),
}));
