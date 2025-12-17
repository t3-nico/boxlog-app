'use client'

import type { ReactNode } from 'react'

import { SelectionBar } from '@/components/common/SelectionBar'

interface TagsSelectionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: ReactNode
}

/**
 * タグページ選択バー（共通SelectionBarのラッパー）
 *
 * @deprecated 共通SelectionBarを直接使用することを推奨
 */
export function TagsSelectionBar({ selectedCount, onClearSelection, actions }: TagsSelectionBarProps) {
  return (
    <SelectionBar selectedCount={selectedCount} onClearSelection={onClearSelection} actions={actions} paddingX="px-4" />
  )
}
