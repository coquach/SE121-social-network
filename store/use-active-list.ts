import { create } from 'zustand';

export type PresenceStatus = 'online' | 'offline' | 'away';

export type PresenceInfo = {
  status: PresenceStatus;
  lastSeen: string | null;
};

interface ActiveListStore {
  // key: userId
  members: Record<string, PresenceInfo>;
  upsert: (userId: string, info: PresenceInfo) => void;
  remove: (userId: string) => void;
  setAll: (members: Record<string, PresenceInfo>) => void;
  getById: (userId: string) => PresenceInfo | undefined;
  isOnline: (userId: string) => boolean;
  toArray: () => {
    userId: string;
    status: PresenceStatus;
    lastSeen: string | null;
  }[];
}

export const useActiveList = create<ActiveListStore>()((set, get) => ({
  members: {},

  upsert: (userId, info) =>
    set((state) => ({
      members: {
        ...state.members,
        [userId]: info,
      },
    })),

  remove: (userId) =>
    set((state) => {
      const next = { ...state.members };
      delete next[userId];
      return { members: next };
    }),

  setAll: (members) =>
    set(() => ({
      members,
    })),

  getById: (userId) => {
    return get().members[userId];
  },

  isOnline: (userId) => {
    const info = get().members[userId];
    return info?.status === 'online';
  },

  toArray: () => {
    const m = get().members;
    return Object.entries(m).map(([userId, info]) => ({
      userId,
      status: info.status,
      lastSeen: info.lastSeen,
    }));
  },
}));
