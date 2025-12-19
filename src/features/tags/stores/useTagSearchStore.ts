import { create } from 'zustand'

interface TagSearchState {
  /** 検索クエリ */
  searchQuery: string
  /** 検索クエリを設定 */
  setSearchQuery: (query: string) => void
  /** 検索クエリをクリア */
  clearSearch: () => void
}

/**
 * タグ検索状態を管理するstore
 */
export const useTagSearchStore = create<TagSearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '' }),
}))
