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
import type { TagUsage, TagWithChildren } from '@/types/tags'
import { AlertTriangle } from 'lucide-react'

interface TagArchiveDialogProps {
  tag: TagWithChildren | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function TagArchiveDialog({ tag, onClose, onConfirm }: TagArchiveDialogProps) {
  const [usage, setUsage] = useState<TagUsage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // タグの使用状況を取得
  useEffect(() => {
    if (!tag) {
      setUsage(null)
      return
    }

    const fetchUsage = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/tags/${tag.id}?usage=true`)
        if (response.ok) {
          const data = await response.json()
          setUsage(data.usage || { planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
        } else {
          // エラー時はデフォルト値
          setUsage({ planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
        }
      } catch (error) {
        console.error('Failed to fetch tag usage:', error)
        setUsage({ planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [tag])

  const handleConfirm = async () => {
    setIsArchiving(true)
    try {
      await onConfirm()
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <AlertDialog open={!!tag} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle>タグ「{tag?.name}」をアーカイブしますか？</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3">
          {/* 警告 */}
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">アーカイブされたタグは新規のタグ付けには使用できません</p>
          </div>

          {/* 使用状況 */}
          {isLoading ? (
            <div className="bg-muted flex items-center justify-center rounded-lg p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : usage ? (
            <div className="bg-muted rounded-lg p-4">
              <p className="mb-2 text-sm font-medium">現在の使用状況:</p>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Plans: {usage.planCount}件</li>
                <li>• Events: {usage.eventCount}件</li>
                <li>• Tasks: {usage.taskCount}件</li>
              </ul>
              <p className="text-muted-foreground mt-2 text-sm font-medium">合計: {usage.totalCount}件</p>
            </div>
          ) : null}

          {/* アーカイブ後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">アーカイブすると:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>✓ 新規のタグ付けには使用できなくなります</li>
              <li>✓ 既存のアイテムには引き続き表示されます</li>
              <li>✓ 統計データにも引き続き含まれます</li>
              <li>✓ アーカイブページからいつでも復元できます</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isArchiving}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isArchiving}
            className="bg-warning text-warning-foreground hover:bg-warning/92 active:bg-warning/88"
          >
            {isArchiving ? 'アーカイブ中...' : 'アーカイブ'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
