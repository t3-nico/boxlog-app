'use client'

import { useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useBoxStore } from '@/features/box-management/stores/box-store'
import type { TaskStatus, TaskPriority, TaskType } from '@/types/unified'

export function useFilterUrlSync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    filters, 
    setSearchFilter, 
    setStatusFilter, 
    setPriorityFilter, 
    setTypeFilter, 
    setTagFilter, 
    setSmartFolderFilter 
  } = useBoxStore()

  // Sync URL params to store on mount and param changes
  useEffect(() => {
    const search = (searchParams || new URLSearchParams()).get('search') || ''
    const status = (searchParams || new URLSearchParams()).get('status')?.split(',').filter(Boolean) || []
    const priority = (searchParams || new URLSearchParams()).get('priority')?.split(',').filter(Boolean) || []
    const type = (searchParams || new URLSearchParams()).get('type')?.split(',').filter(Boolean) || []
    const tags = (searchParams || new URLSearchParams()).get('tags')?.split(',').filter(Boolean) || []
    const smartFolder = (searchParams || new URLSearchParams()).get('folder') || ''

    // Only update if different from current state to avoid infinite loops
    if (filters.search !== search) setSearchFilter(search)
    if (JSON.stringify(filters.status) !== JSON.stringify(status)) setStatusFilter(status as TaskStatus[])
    if (JSON.stringify(filters.priority) !== JSON.stringify(priority)) setPriorityFilter(priority as TaskPriority[])
    if (JSON.stringify(filters.type) !== JSON.stringify(type)) setTypeFilter(type as TaskType[])
    if (JSON.stringify(filters.tags) !== JSON.stringify(tags)) setTagFilter(tags)
    if (filters.smartFolder !== smartFolder) setSmartFolderFilter(smartFolder)
  }, [searchParams, filters.search, filters.status, filters.priority, filters.type, filters.tags, filters.smartFolder, setSearchFilter, setStatusFilter, setPriorityFilter, setTypeFilter, setTagFilter, setSmartFolderFilter])

  // Sync store to URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.search) params.set('search', filters.search)
    if (filters.status.length > 0) params.set('status', filters.status.join(','))
    if (filters.priority.length > 0) params.set('priority', filters.priority.join(','))
    if (filters.type.length > 0) params.set('type', filters.type.join(','))
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (filters.smartFolder) params.set('folder', filters.smartFolder)

    const newUrl = params.toString() ? `?${params.toString()}` : '/box'
    
    // Only update URL if it's different to avoid infinite loops
    if (window.location.search !== params.toString()) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, router])
}