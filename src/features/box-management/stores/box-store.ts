// Temporary box store implementation
// Implementation tracked in Issue #89

import { create } from 'zustand'

interface BoxFilters {
  search: string
  status: string[]
  priority: string[]
  type: string[]
  tags: string[]
  smartFolder: string
}

interface BoxStore {
  filters: BoxFilters
  setSearchFilter: (search: string) => void
  setStatusFilter: (status: string[]) => void
  setPriorityFilter: (priority: string[]) => void
  setTypeFilter: (type: string[]) => void
  setTagFilter: (tags: string[]) => void
  setSmartFolderFilter: (smartFolder: string) => void
}

export const useBoxStore = create<BoxStore>((set) => ({
  filters: {
    search: '',
    status: [],
    priority: [],
    type: [],
    tags: [],
    smartFolder: ''
  },
  setSearchFilter: (search) =>
    set((state) => ({
      filters: { ...state.filters, search }
    })),
  setStatusFilter: (status) =>
    set((state) => ({
      filters: { ...state.filters, status }
    })),
  setPriorityFilter: (priority) =>
    set((state) => ({
      filters: { ...state.filters, priority }
    })),
  setTypeFilter: (type) =>
    set((state) => ({
      filters: { ...state.filters, type }
    })),
  setTagFilter: (tags) =>
    set((state) => ({
      filters: { ...state.filters, tags }
    })),
  setSmartFolderFilter: (smartFolder) =>
    set((state) => ({
      filters: { ...state.filters, smartFolder }
    }))
}))