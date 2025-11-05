'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import type { TagWithChildren } from '@/types/tags'

interface TagsPageContextValue {
  selectedGroupId: string | null
  setSelectedGroupId: (id: string | null) => void
  tags: TagWithChildren[]
  setTags: (tags: TagWithChildren[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onCreateGroup: (() => void) | null
  setOnCreateGroup: (handler: (() => void) | null) => void
}

const TagsPageContext = createContext<TagsPageContextValue | null>(null)

export function useTagsPageContext() {
  const context = useContext(TagsPageContext)
  if (!context) {
    throw new Error('useTagsPageContext must be used within TagsPageProvider')
  }
  return context
}

interface TagsPageProviderProps {
  children: ReactNode
}

export function TagsPageProvider({ children }: TagsPageProviderProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [tags, setTags] = useState<TagWithChildren[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [onCreateGroup, setOnCreateGroup] = useState<(() => void) | null>(null)

  return (
    <TagsPageContext.Provider
      value={{
        selectedGroupId,
        setSelectedGroupId,
        tags,
        setTags,
        isLoading,
        setIsLoading,
        onCreateGroup,
        setOnCreateGroup,
      }}
    >
      {children}
    </TagsPageContext.Provider>
  )
}
