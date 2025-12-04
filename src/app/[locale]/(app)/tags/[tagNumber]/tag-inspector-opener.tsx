'use client'

import { useTags } from '@/features/tags/hooks/use-tags'
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore'
import type { TagWithChildren } from '@/types/tags'
import { useEffect } from 'react'

interface TagInspectorOpenerProps {
  tagNumber: string
}

/**
 * URLからタグ番号を受け取り、対応するタグのInspectorを自動的に開くコンポーネント
 */
export function TagInspectorOpener({ tagNumber }: TagInspectorOpenerProps) {
  const { data: tags = [], isLoading } = useTags(true)
  const { openInspector, isOpen } = useTagInspectorStore()

  useEffect(() => {
    if (isLoading || tags.length === 0) return

    // タグ番号からタグを検索
    const findTagByNumber = (tags: TagWithChildren[], number: number): TagWithChildren | null => {
      for (const tag of tags) {
        if (tag.tag_number === number) return tag
        if (tag.children) {
          const found = findTagByNumber(tag.children, number)
          if (found) return found
        }
      }
      return null
    }

    const targetTag = findTagByNumber(tags, Number(tagNumber))
    if (targetTag && !isOpen) {
      openInspector(targetTag.id)
    }
  }, [tagNumber, tags, isLoading, openInspector, isOpen])

  return null
}
