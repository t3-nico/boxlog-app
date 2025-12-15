'use client'

import { useTags } from '@/features/tags/hooks/use-tags'
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore'
import { useEffect } from 'react'

interface TagInspectorOpenerProps {
  tagNumber: string
}

/**
 * URLからタグ番号を受け取り、対応するタグのInspectorを自動的に開くコンポーネント
 */
export function TagInspectorOpener({ tagNumber }: TagInspectorOpenerProps) {
  const { data: tags = [], isPending } = useTags(true)
  const { openInspector, isOpen } = useTagInspectorStore()

  useEffect(() => {
    if (isPending || tags.length === 0) return

    // タグ番号からタグを検索（フラット構造）
    const targetTag = tags.find((tag) => tag.tag_number === Number(tagNumber))
    if (targetTag && !isOpen) {
      openInspector(targetTag.id)
    }
  }, [tagNumber, tags, isPending, openInspector, isOpen])

  return null
}
