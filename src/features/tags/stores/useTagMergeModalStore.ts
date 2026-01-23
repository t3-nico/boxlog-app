import { create } from 'zustand';

/**
 * タグマージモーダルの状態管理
 */
interface TagMergeModalStore {
  isOpen: boolean;
  /** マージ元のタグ情報 */
  sourceTag: { id: string; name: string; color?: string | null } | null;
  /** 子タグがあるか */
  hasChildren: boolean;
  openModal: (
    sourceTag: { id: string; name: string; color?: string | null },
    hasChildren?: boolean,
  ) => void;
  closeModal: () => void;
}

export const useTagMergeModalStore = create<TagMergeModalStore>((set) => ({
  isOpen: false,
  sourceTag: null,
  hasChildren: false,
  openModal: (sourceTag, hasChildren = false) => set({ isOpen: true, sourceTag, hasChildren }),
  closeModal: () => set({ isOpen: false, sourceTag: null, hasChildren: false }),
}));
