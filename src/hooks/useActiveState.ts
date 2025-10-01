'use client'

import { usePathname, useSearchParams } from 'next/navigation'

import { useBoxStore } from '@/features/box-management/stores/box-store'

export const useActiveState = () => {
  const pathname = usePathname()
  const _searchParams = useSearchParams()
  const { filters } = useBoxStore()

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
    isSmartFolderActive
  }
}