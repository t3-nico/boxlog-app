'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import type { InboxItem } from '../../hooks/useInboxData'
import { useInboxFocusStore } from '../../stores/useInboxFocusStore'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'
import { InboxActionMenuItems } from './InboxActionMenuItems'

interface InboxRowWrapperProps {
  /** 表示するInboxアイテム */
  item: InboxItem
  /** 子要素（TableRow） */
  children: ReactNode
  /** 選択されているか */
  isSelected: boolean
}

/**
 * Inbox行ラッパーコンポーネント
 *
 * DataTableのrowWrapper propで使用
 * - ContextMenuを提供
 * - クリックでInspectorを開く
 * - フォーカス管理
 */
export function InboxRowWrapper({ item, children, isSelected }: InboxRowWrapperProps) {
  const { openInspector } = usePlanInspectorStore()
  const { setSelectedIds } = useInboxSelectionStore()
  const { focusedId, setFocusedId } = useInboxFocusStore()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const isFocused = focusedId === item.id

  // フォーカスされた行をスクロールして表示
  useEffect(() => {
    if (isFocused && wrapperRef.current) {
      wrapperRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isFocused])

  // コンテキストメニューアクション
  const handleEdit = () => {
    openInspector(item.id)
  }

  const handleDuplicate = () => {
    // TODO: 複製機能実装
    console.log('Duplicate:', item.id)
  }

  const handleAddTags = () => {
    // TODO: タグ追加機能実装
    console.log('Add tags:', item.id)
  }

  const handleChangeDueDate = () => {
    // TODO: 期限変更機能実装
    console.log('Change due date:', item.id)
  }

  const handleArchive = () => {
    // TODO: アーカイブ機能実装
    console.log('Archive:', item.id)
  }

  const handleDelete = () => {
    // TODO: 削除機能実装
    console.log('Delete:', item.id)
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          ref={wrapperRef}
          className={cn(
            'hover:bg-muted/50 cursor-pointer transition-colors',
            isSelected && 'bg-primary/10 hover:bg-primary/15',
            isFocused && 'ring-primary ring-2 ring-inset'
          )}
          onClick={() => {
            openInspector(item.id)
            setFocusedId(item.id)
          }}
          onContextMenu={() => {
            // 右クリックされた行を選択
            if (!isSelected) {
              setSelectedIds([item.id])
            }
          }}
        >
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <InboxActionMenuItems
          item={item}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onAddTags={handleAddTags}
          onChangeDueDate={handleChangeDueDate}
          onArchive={handleArchive}
          onDelete={handleDelete}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem onClick={onClick} className={variant === 'destructive' ? 'text-destructive' : ''}>
              {icon}
              {label}
            </ContextMenuItem>
          )}
          renderSeparator={() => <ContextMenuSeparator />}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
