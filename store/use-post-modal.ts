import { RootType, TargetType } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { create } from 'zustand';

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
  rootId: string | null;
  rootType: RootType | null;
  data?: PostSnapshotDTO | SharePostSnapshotDTO;
  isOpen: boolean;
  openModal: (
    rootId: string,
    rootType: RootType,
    data?: PostSnapshotDTO | SharePostSnapshotDTO
  ) => void;
  closeModal: () => void;
}

export const useCommentModal = create<CommentModalStore>((set) => ({
  rootId: null,
  rootType: null,
  data: undefined,
  isOpen: false,
  openModal: (rootId, rootType, data) =>
    set({ isOpen: true, rootId, rootType, data }),
  closeModal: () =>
    set({ isOpen: false, rootId: null, rootType: null, data: undefined }),
}));

interface CreateShareModalStore {
  data?: PostSnapshotDTO;
  isOpen: boolean;
  openModal: (data: PostSnapshotDTO ) => void;
  closeModal: () => void;
}
export const useCreateShareModal = create<CreateShareModalStore>((set) => ({
  postRootId: undefined,
  data: undefined,
  isOpen: false,
  openModal: (data: PostSnapshotDTO) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: undefined }),
}));
