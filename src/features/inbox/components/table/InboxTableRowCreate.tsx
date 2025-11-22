'use client'

import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { useTicketMutations } from '@/features/plans/hooks/useTicketMutations'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'

/**
 * InboxTableRowCreate コンポーネントの外部から呼び出せるメソッド
 */
export interface InboxTableRowCreateHandle {
  /** 新規作成モードを開始 */
  startCreate: () => void
}

/**
 * Notionスタイルの新規チケット作成行
 *
 * クリックで即座に新しいチケットを作成し、タイトル入力状態にする
 * - Enterで確定（タイトルが空の場合は削除）
 * - Escapeでキャンセル（作成したチケットを削除）
 * - フォーカスアウトで確定
 *
 * @example
 * ```tsx
 * const createRef = useRef<InboxTableRowCreateHandle>(null)
 * <InboxTableRowCreate ref={createRef} />
 * // 外部から作成モードを開始
 * createRef.current?.startCreate()
 * ```
 */
export const InboxTableRowCreate = forwardRef<InboxTableRowCreateHandle>((props, ref) => {
  const { getVisibleColumns } = useInboxColumnStore()
  const { createTicket, deleteTicket } = useTicketMutations()
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [tempTicketId, setTempTicketId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const visibleColumns = getVisibleColumns()

  // 作成モードになったら自動フォーカス
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  // 外部から呼び出し可能なメソッドを公開
  useImperativeHandle(ref, () => ({
    startCreate: handleStartCreate,
  }))

  // Notionスタイル：クリックで即座にチケットを作成してタイトル入力状態にする
  const handleStartCreate = async () => {
    if (isCreating) return

    setIsCreating(true)
    try {
      // 空のチケットを作成（楽観的更新）
      const newTicket = await createTicket.mutateAsync({
        title: '無題のチケット',
        status: 'backlog',
      })

      if (newTicket?.id) {
        setTempTicketId(newTicket.id)
        setTitle('')
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
      setIsCreating(false)
    }
  }

  // タイトル確定
  const handleSaveTitle = async () => {
    if (!tempTicketId) {
      setIsCreating(false)
      return
    }

    try {
      if (title.trim()) {
        // タイトルを更新
        await createTicket.mutateAsync({
          title: title.trim(),
          status: 'backlog',
        })
      } else {
        // タイトルが空の場合は削除
        await deleteTicket.mutateAsync({ id: tempTicketId })
      }
    } catch (error) {
      console.error('Failed to save title:', error)
    } finally {
      setIsCreating(false)
      setTitle('')
      setTempTicketId(null)
    }
  }

  // キャンセル
  const handleCancel = async () => {
    if (tempTicketId) {
      try {
        await deleteTicket.mutateAsync({ id: tempTicketId })
      } catch (error) {
        console.error('Failed to delete temp ticket:', error)
      }
    }
    setIsCreating(false)
    setTitle('')
    setTempTicketId(null)
  }

  return (
    <TableRow
      className={cn('hover:bg-muted/30 cursor-pointer border-none transition-colors', isCreating && 'bg-muted/50')}
      onClick={handleStartCreate}
    >
      <TableCell colSpan={visibleColumns.length} className="h-10" style={{ paddingLeft: '64px' }}>
        {isCreating ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveTitle()
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            onBlur={handleSaveTitle}
            placeholder="チケットのタイトルを入力..."
            className="h-8 border-none px-0 shadow-none focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-muted-foreground flex items-center gap-2">
            <Plus className="size-4" />
            <span className="text-sm">新しいチケット</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
})

InboxTableRowCreate.displayName = 'InboxTableRowCreate'
