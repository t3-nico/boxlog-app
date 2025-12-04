import { create } from 'zustand'

/**
 * Tag Inspector状態管理
 *
 * タグ詳細のSheet表示を制御
 */

interface TagInspectorStore {
  isOpen: boolean
  tagId: string | null
  openInspector: (tagId: string) => void
  closeInspector: () => void
}

export const useTagInspectorStore = create<TagInspectorStore>((set) => ({
  isOpen: false,
  tagId: null,
  openInspector: (tagId) =>
    set({
      isOpen: true,
      tagId,
    }),
  closeInspector: () => set({ isOpen: false, tagId: null }),
}))
