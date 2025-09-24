import { create } from 'zustand';
interface EditModalStore {
  id?: string,
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useEditModal = create<EditModalStore>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false , id: undefined}),
}));
