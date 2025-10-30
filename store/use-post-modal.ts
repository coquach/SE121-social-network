import { TargetType } from "@/models/social/enums/social.enum";
import { PostSnapshotDTO } from "@/models/social/post/postDTO";
import { SharePostSnapshotDTO } from "@/models/social/post/sharePostDTO";
import { create } from "zustand";


interface ReactionModalStore {
  targetId: string | null;
  targetType: TargetType | null;
  isOpen: boolean;
  openModal: (targetType: TargetType, targetId: string) => void;
  closeModal: () => void;
}
export const useReactionModal = create<ReactionModalStore>((set) => ({
  targetId: null,
  targetType: null,
  isOpen: false,
  openModal: (targetType: TargetType, targetId: string) =>
    set({ isOpen: true, targetType, targetId }),
  closeModal: () => set({ isOpen: false, targetId: null, targetType: null }),
}));


interface CommentModalStore {
  data?: PostSnapshotDTO | SharePostSnapshotDTO;
  isOpen: boolean;
  openModal: ( data?: PostSnapshotDTO | SharePostSnapshotDTO) => void;
  closeModal: () => void;
}

export const usePostModal = create<CommentModalStore>((set) => ({
  type: null,
  data: undefined,
  isOpen: false,
  openModal: (data) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: undefined }),
}));


interface CreateShareModalStore {
  postRootId?: string;
  isOpen: boolean;
  openModal: (postRootId: string) => void;
  closeModal: () => void;
}
export const useCreateShareModal = create<CreateShareModalStore>((set) => ({
  postRootId: undefined,
  isOpen: false,
  openModal: (postRootId: string) => set({ isOpen: true, postRootId }),
  closeModal: () => set({ isOpen: false, postRootId: undefined }),
}));