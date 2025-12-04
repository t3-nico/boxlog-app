import { create } from 'zustand'

/**
 * タグ作成モーダルの状態管理
 */
interface TagCreateModalStore {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useTagCreateModalStore = create<TagCreateModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
