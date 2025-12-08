'use client'

import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TagGroup } from '@/features/tags/types'
import { AlertTriangle } from 'lucide-react'

interface TagGroupDeleteDialogProps {
  group: TagGroup | null
  tagCount?: number
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function TagGroupDeleteDialog({ group, tagCount = 0, onClose, onConfirm }: TagGroupDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // グループが変更されたら確認テキストをリセット
  useEffect(() => {
    if (!group) {
      setConfirmText('')
    }
  }, [group])

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  const requiresConfirmation = tagCount > 10
  const canDelete = !requiresConfirmation || confirmText === group?.name

  return (
    <AlertDialog open={!!group} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-2xl gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle>グループ「{group?.name}」を削除しますか？</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3">
          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">この操作は元に戻せません</p>
          </div>

          {/* タグ数表示 */}
          <div className="bg-surface-container rounded-xl p-4">
            <p className="mb-2 text-sm font-medium">このグループに属するタグ:</p>
            <p className="text-muted-foreground text-sm">{tagCount}件のタグが属しています</p>
          </div>

          {/* 削除後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">削除すると:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• グループのみが削除されます</li>
              <li>• 属するタグは「グループなし」状態になります</li>
              <li>• タグ自体は削除されず、引き続き使用できます</li>
            </ul>
          </div>

          {/* 確認入力（タグ数が10件を超える場合） */}
          {requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input" className="text-sm font-medium">
                確認のため、グループ名「{group?.name}」を入力してください
              </Label>
              <Input
                id="confirm-input"
                placeholder={group?.name}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
          >
            {isDeleting ? '削除中...' : '削除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
