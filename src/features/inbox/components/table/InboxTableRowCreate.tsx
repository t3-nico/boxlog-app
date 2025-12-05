'use client'

import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
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
 * Notionスタイルの新規プラン作成行
 *
 * クリックで即座に新しいプランを作成し、タイトル入力状態にする
 * - Enterで確定（タイトルが空の場合は削除）
 * - Escapeでキャンセル（作成したプランを削除）
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
export const InboxTableRowCreate = forwardRef<InboxTableRowCreateHandle>((_props, ref) => {
  const { getVisibleColumns } = useInboxColumnStore()
  const { createPlan, deletePlan } = usePlanMutations()
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [tempplanId, setTempplanId] = useState<string | null>(null)
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

  // Notionスタイル：クリックで即座にプランを作成してタイトル入力状態にする
  const handleStartCreate = async () => {
    if (isCreating) return

    setIsCreating(true)
    try {
      // 空のプランを作成（楽観的更新）
      const newplan = await createPlan.mutateAsync({
        title: '無題のプラン',
        status: 'todo',
      })

      if (newplan?.id) {
        setTempplanId(newplan.id)
        setTitle('')
      }
    } catch (error) {
      console.error('Failed to create plan:', error)
      setIsCreating(false)
    }
  }

  // タイトル確定
  const handleSaveTitle = async () => {
    if (!tempplanId) {
      setIsCreating(false)
      return
    }

    try {
      if (title.trim()) {
        // タイトルを更新
        await createPlan.mutateAsync({
          title: title.trim(),
          status: 'todo',
        })
      } else {
        // タイトルが空の場合は削除
        await deletePlan.mutateAsync({ id: tempplanId })
      }
    } catch (error) {
      console.error('Failed to save title:', error)
    } finally {
      setIsCreating(false)
      setTitle('')
      setTempplanId(null)
    }
  }

  // キャンセル
  const handleCancel = async () => {
    if (tempplanId) {
      try {
        await deletePlan.mutateAsync({ id: tempplanId })
      } catch (error) {
        console.error('Failed to delete temp plan:', error)
      }
    }
    setIsCreating(false)
    setTitle('')
    setTempplanId(null)
  }

  return (
    <TableRow
      className={cn(
        'hover:bg-state-hover cursor-pointer border-none transition-colors',
        isCreating && 'bg-surface-container'
      )}
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
            placeholder="プランのタイトルを入力..."
            className="h-8 border-none px-0 shadow-none focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-muted-foreground flex items-center gap-2">
            <Plus className="size-4" />
            <span className="text-sm">新しいプラン</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
})

InboxTableRowCreate.displayName = 'InboxTableRowCreate'
