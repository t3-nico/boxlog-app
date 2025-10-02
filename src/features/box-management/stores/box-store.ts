// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
// Box store implementation using StoreFactory pattern
// Implementation tracked in Issue #89 - Now using unified state management

import { StoreFactory } from '@/lib/store-factory'

interface BoxFilters {
  search: string
  status: string[]
  priority: string[]
  type: string[]
  tags: string[]
  smartFolder: string
}

interface BoxStore {
  setSearchFilter: (search: string) => void
  setStatusFilter: (status: string[]) => void
  setPriorityFilter: (priority: string[]) => void
  setTypeFilter: (type: string[]) => void
  setTagFilter: (tags: string[]) => void
  setSmartFolderFilter: (smartFolder: string) => void
}

// 初期状態の定義
const initialBoxState = {
  filters: {
    search: '',
    status: [],
    priority: [],
    type: [],
    tags: [],
    smartFolder: ''
  } as BoxFilters
}

export const useBoxStore = StoreFactory.create<typeof initialBoxState & BoxStore>({
  type: 'base',
  name: 'box-store',
  initialState: initialBoxState,
  devtools: true,
  actions: (set, _get) => ({
    setSearchFilter: (search: string) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, search }
      })),
    setStatusFilter: (status: string[]) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, status }
      })),
    setPriorityFilter: (priority: string[]) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, priority }
      })),
    setTypeFilter: (type: string[]) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, type }
      })),
    setTagFilter: (tags: string[]) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, tags }
      })),
    setSmartFolderFilter: (smartFolder: string) =>
      set((state: typeof initialBoxState) => ({
        filters: { ...state.filters, smartFolder }
      }))
  }),
})