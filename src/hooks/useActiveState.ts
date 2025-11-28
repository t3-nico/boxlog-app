'use client'

import { usePathname } from 'next/navigation'
export const useActiveState = () => {
  const pathname = usePathname()
  // const { filters } = useTaskStore()
  const filters: { tags: string[]; smartFolder: string | null } = { tags: [], smartFolder: null } // 一時的にモック
  const currentView = (pathname || '/').split('/')[1] || 'calendar'
  const selectedTag = filters.tags?.[0] || null
  const selectedSmartFolder = filters.smartFolder || null
  const isViewActive = (viewId: string) => {
    return currentView === viewId
  }
  const isTagActive = (tagId: string) => {
    return filters.tags?.includes(tagId) || false
  }
  const isSmartFolderActive = (folderId: string) => {
    return selectedSmartFolder === folderId
  }
  return {
    currentView,
    selectedTag,
    selectedSmartFolder,
    isViewActive,
    isTagActive,
    isSmartFolderActive,
  }
}
