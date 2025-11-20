'use client'

import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { Plus } from 'lucide-react'

interface InboxCardCreateProps {
  isCreating: boolean
  onStartCreate: () => void
  onFinishCreate: () => void
}

/**
 * InboxCardCreate - インライン新規作成カード
 *
 * **機能**:
 * - ボタンクリックで新規作成モード開始
 * - タイトル入力 → Enter で確定
 * - Escape でキャンセル
 *
 * **Note**: TicketKanbanBoardのKanbanColumnと同じスタイル
 */
export function InboxCardCreate({ isCreating, onStartCreate, onFinishCreate }: InboxCardCreateProps) {
  const { createTicket } = useTicketMutations()
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 作成モードになったら自動フォーカス
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  // タイトル確定
  const handleCreate = () => {
    if (!title.trim()) return

    createTicket.mutate({
      title: title.trim(),
      status: 'backlog',
    })

    // リセット
    setTitle('')
    onFinishCreate()
  }

  // キーボードイベント
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      setTitle('')
      onFinishCreate()
    }
  }

  return (
    <>
      {/* 新規作成フォーム（入力中） */}
      {isCreating && (
        <div className="bg-card border-border relative space-y-2 rounded-lg border p-3 shadow-sm">
          {/* タイトル入力 */}
          <Input
            ref={inputRef}
            autoFocus
            placeholder="タイトルを入力..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
        </div>
      )}

      {/* 新規追加ボタン（未入力時） */}
      {!isCreating && (
        <button
          onClick={onStartCreate}
          className="text-muted-foreground hover:text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-lg p-3 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>新規追加</span>
        </button>
      )}
    </>
  )
}
