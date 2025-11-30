'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { useInboxViewStore } from '../../stores/useInboxViewStore'
import type { InboxView } from '../../types/view'

interface ViewSettingsDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログを閉じる関数 */
  onOpenChange: (open: boolean) => void
  /** 編集対象のビュー（新規作成時はundefined） */
  view?: InboxView
  /** 現在のフィルター・ソート・ページサイズ（新規作成時に使用） */
  currentState?: {
    filters: InboxView['filters']
    sorting?: InboxView['sorting']
    pageSize?: number
  }
}

/**
 * ビュー設定ダイアログ
 *
 * 新規ビューの作成または既存ビューの編集を行うダイアログ
 * - 新規作成: 現在のフィルター・ソート設定をベースに作成
 * - 編集: 既存ビューの名前を変更
 *
 * @example
 * ```tsx
 * <ViewSettingsDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   currentState={{ filters, sorting, pageSize }}
 * />
 * ```
 */
export function ViewSettingsDialog({ open, onOpenChange, view, currentState }: ViewSettingsDialogProps) {
  const { createView, updateView } = useInboxViewStore()
  const [name, setName] = useState(view?.name || '')

  // viewが変更されたら名前をリセット
  useEffect(() => {
    setName(view?.name || '')
  }, [view])

  const handleSave = () => {
    if (!name.trim()) return

    if (view) {
      // 既存ビューの編集
      updateView(view.id, { name: name.trim() })
    } else {
      // 新規ビュー作成
      createView({
        name: name.trim(),
        filters: currentState?.filters || {},
        sorting: currentState?.sorting,
        isDefault: false,
      })
    }

    // ダイアログを閉じる
    onOpenChange(false)
    setName('')
  }

  const handleCancel = () => {
    onOpenChange(false)
    setName('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{view ? 'ビューを編集' : '新しいビューを作成'}</DialogTitle>
          <DialogDescription>
            {view
              ? 'ビューの名前を変更できます。'
              : '現在のフィルター・ソート設定を保存して、後で呼び出すことができます。'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="view-name">ビュー名</Label>
            <Input
              id="view-name"
              placeholder="例: 高優先度タスク"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          </div>

          {!view && currentState && (
            <div className="bg-muted rounded-xl p-3 text-sm">
              <p className="mb-2 font-medium">保存される設定:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                {currentState.filters.status && currentState.filters.status.length > 0 && (
                  <li>ステータス: {currentState.filters.status.join(', ')}</li>
                )}
                {currentState.filters.search && <li>検索: {currentState.filters.search}</li>}
                {currentState.sorting && (
                  <li>
                    ソート: {currentState.sorting.field} ({currentState.sorting.direction === 'asc' ? '昇順' : '降順'})
                  </li>
                )}
                {currentState.pageSize && <li>ページサイズ: {currentState.pageSize}件/ページ</li>}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {view ? '更新' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
