'use client'

import { useState } from 'react'

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

type SaveViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  currentFilters: {
    status?: string[]
    priority?: string[]
    tags?: string[]
    search?: string
  }
}

/**
 * View保存ダイアログ
 *
 * 現在のフィルター設定をViewとして保存
 *
 * @example
 * ```tsx
 * <SaveViewDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSave={(name, type) => console.log('Save', name, type)}
 *   currentFilters={{ priority: ['high'] }}
 * />
 * ```
 */
export function SaveViewDialog({ open, onOpenChange, onSave, currentFilters }: SaveViewDialogProps) {
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return

    onSave(name.trim())
    setName('')
    onOpenChange(false)
  }

  // フィルターのプレビュー文字列を生成
  const getFilterPreview = () => {
    const parts: string[] = []

    if (currentFilters.status && currentFilters.status.length > 0) {
      parts.push(`ステータス: ${currentFilters.status.join(', ')}`)
    }
    if (currentFilters.priority && currentFilters.priority.length > 0) {
      parts.push(`優先度: ${currentFilters.priority.join(', ')}`)
    }
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      parts.push(`タグ: ${currentFilters.tags.join(', ')}`)
    }
    if (currentFilters.search) {
      parts.push(`検索: "${currentFilters.search}"`)
    }

    return parts.length > 0 ? parts.join(' | ') : 'フィルターなし'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Viewを保存</DialogTitle>
          <DialogDescription>現在のフィルター設定を新しいViewとして保存します</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* View名 */}
          <div className="grid gap-2">
            <Label htmlFor="view-name">View名</Label>
            <Input
              id="view-name"
              placeholder="例: 高優先度タスク"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave()
                }
              }}
            />
          </div>

          {/* フィルタープレビュー */}
          <div className="grid gap-2">
            <Label>保存される設定</Label>
            <div className="bg-muted text-muted-foreground rounded-md p-3 text-sm">{getFilterPreview()}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
