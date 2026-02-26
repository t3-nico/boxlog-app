import { create } from 'zustand';

/**
 * タグ作成モーダルの状態管理
 */
interface TagCreateModalStore {
  isOpen: boolean;
  /** デフォルトの親タグID（子タグ作成時にプリセット） */
  defaultParentId: string | null;
  openModal: (parentId?: string) => void;
  closeModal: () => void;
}

export const useTagCreateModalStore = create<TagCreateModalStore>((set) => ({
  isOpen: false,
  defaultParentId: null,
  openModal: (parentId) => set({ isOpen: true, defaultParentId: parentId ?? null }),
  closeModal: () => set({ isOpen: false, defaultParentId: null }),
}));
