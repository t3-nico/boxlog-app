import { create } from 'zustand';

/**
 * タグマージモーダルの状態管理
 */
interface TagMergeModalStore {
  isOpen: boolean;
  /** マージ元のタグ情報 */
  sourceTag: { id: string; name: string; color?: string | null } | null;
  openModal: (sourceTag: { id: string; name: string; color?: string | null }) => void;
  closeModal: () => void;
}

export const useTagMergeModalStore = create<TagMergeModalStore>((set) => ({
  isOpen: false,
  sourceTag: null,
  openModal: (sourceTag) => set({ isOpen: true, sourceTag }),
  closeModal: () => set({ isOpen: false, sourceTag: null }),
}));
