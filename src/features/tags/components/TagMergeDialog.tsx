'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useMergeTag, useTags } from '@/features/tags/hooks/use-tags'
import type { Tag } from '@/features/tags/types'
import { cn } from '@/lib/utils'
import { AlertCircle, Check, ChevronDown, GitMerge } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface TagMergeDialogProps {
  tag: Tag | null
  onClose: (targetTagId?: string) => void
}

/**
 * タグマージダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 * TagDeleteDialogと同じ構造
 */
export function TagMergeDialog({ tag, onClose }: TagMergeDialogProps) {
  const t = useTranslations()
  const [targetTagId, setTargetTagId] = useState<string>('')
  const [isMerging, setIsMerging] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tags = [] } = useTags()
  const mergeTagMutation = useMergeTag()

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  // タグが変更されたらリセット
  useEffect(() => {
    if (!tag) {
      setTargetTagId('')
      setIsDropdownOpen(false)
      setError(null)
    }
  }, [tag])

  // ソースタグを除外（フラット構造なので自分自身のみ除外）
  const availableTags = tags.filter((t) => {
    if (!tag) return false
    // 自分自身は除外
    if (t.id === tag.id) return false
    // アクティブなタグのみ
    if (!t.is_active) return false
    return true
  })

  const handleMerge = useCallback(async () => {
    // エラーをクリア
    setError(null)

    if (!tag || !targetTagId) {
      setError(t('tags.merge.noTargetSelected'))
      return
    }

    setIsMerging(true)
    try {
      // 常にプラン紐付けを移行し、統合元タグを削除
      const result = await mergeTagMutation.mutateAsync({
        sourceTagId: tag.id,
        targetTagId,
        mergeAssociations: true,
        deleteSource: true,
      })

      toast.success(t('tags.merge.success', { count: result.merged_associations || 0 }))
      // 統合先タグIDを渡して閉じる（インスペクターで統合先を開くため）
      onClose(targetTagId)
    } catch (err) {
      console.error('Merge failed:', err)
      setError(t('tags.merge.failed'))
    } finally {
      setIsMerging(false)
    }
  }, [tag, targetTagId, mergeTagMutation, onClose, t])

  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isMerging) {
        onClose()
      }
    },
    [isMerging, onClose]
  )

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!tag) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMerging) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tag, isMerging, onClose])

  if (!mounted || !tag) return null

  // 選択中のタグを取得
  const selectedTag = availableTags.find((t) => t.id === targetTagId)

  const dialog = (
    <div
      className="animate-in fade-in fixed inset-0 z-[250] flex items-center justify-center bg-black/80 duration-150"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-merge-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 448px)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <GitMerge className="text-primary size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-merge-dialog-title" className="text-lg leading-tight font-semibold">
              {t('tags.merge.title')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">{t('tags.merge.description', { source: tag.name })}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-visible">
          {/* 説明 */}
          <p className="text-muted-foreground text-sm">{t('tags.merge.autoMergeDescription')}</p>

          {/* ターゲットタグ選択（カスタムドロップダウン） */}
          <div className="relative inline-block">
            {/* トリガーボタン */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsDropdownOpen((prev) => !prev)
              }}
              className={cn(
                'border-border bg-secondary text-secondary-foreground hover:bg-state-hover flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
                isDropdownOpen && 'ring-ring/50 border-ring ring-2'
              )}
            >
              {selectedTag ? (
                <div className="flex max-w-48 items-center gap-1">
                  <span className="shrink-0" style={{ color: selectedTag.color || DEFAULT_TAG_COLOR }}>
                    #
                  </span>
                  <span className="truncate">{selectedTag.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">{t('tags.merge.selectTarget')}</span>
              )}
              <ChevronDown className="size-4 opacity-50" />
            </button>

            {/* ドロップダウンリスト */}
            {isDropdownOpen && (
              <div className="bg-popover border-border absolute top-full left-0 z-[260] mt-1 max-h-60 max-w-72 min-w-48 overflow-y-auto rounded-md border p-1 shadow-lg">
                {availableTags.length === 0 ? (
                  <p className="text-muted-foreground p-3 text-center text-sm">{t('tags.search.noTags')}</p>
                ) : (
                  availableTags.map((tagItem) => (
                    <button
                      key={tagItem.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTargetTagId(tagItem.id)
                        setIsDropdownOpen(false)
                        setError(null)
                      }}
                      className={cn(
                        'flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors outline-none',
                        'hover:bg-state-hover',
                        targetTagId === tagItem.id && 'bg-state-selected'
                      )}
                    >
                      <span style={{ color: tagItem.color || DEFAULT_TAG_COLOR }}>#</span>
                      <span className="flex-1 truncate">{tagItem.name}</span>
                      {targetTagId === tagItem.id && <Check className="text-primary size-4 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            disabled={isMerging}
            className="hover:bg-state-hover"
          >
            {t('tags.actions.cancel')}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleMerge()
            }}
            disabled={isMerging}
          >
            {isMerging ? t('tags.merge.merging') : t('tags.merge.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
