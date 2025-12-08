'use client'

import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useMergeTag, useTags } from '@/features/tags/hooks/use-tags'
import type { TagWithChildren } from '@/features/tags/types'
import { AlertTriangle, GitMerge } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface TagMergeDialogProps {
  tag: TagWithChildren | null
  onClose: () => void
}

export function TagMergeDialog({ tag, onClose }: TagMergeDialogProps) {
  const t = useTranslations()
  const [targetTagId, setTargetTagId] = useState<string>('')
  const [mergeAssociations, setMergeAssociations] = useState(true)
  const [deleteSource, setDeleteSource] = useState(true)

  const { data: tags = [] } = useTags()
  const mergeTagMutation = useMergeTag()

  // ソースタグと同じタグ、およびソースタグの子タグを除外
  const availableTags = flattenTags(tags).filter((t) => {
    if (!tag) return false
    // 自分自身は除外
    if (t.id === tag.id) return false
    // 子タグも除外（循環を防ぐ）
    if (isDescendant(tag, t.id)) return false
    return true
  })

  const handleMerge = async () => {
    if (!tag || !targetTagId) {
      toast.error(t('tags.merge.noTargetSelected'))
      return
    }

    try {
      const result = await mergeTagMutation.mutateAsync({
        sourceTagId: tag.id,
        targetTagId,
        mergeAssociations,
        deleteSource,
      })

      toast.success(t('tags.merge.success', { count: result.merged_associations || 0 }))
      onClose()
    } catch (error) {
      console.error('Merge failed:', error)
      toast.error(t('tags.merge.failed'))
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTargetTagId('')
      setMergeAssociations(true)
      setDeleteSource(true)
      onClose()
    }
  }

  const hasChildren = tag && tag.children && tag.children.length > 0

  return (
    <AlertDialog open={!!tag} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            {t('tags.merge.title')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* 説明 */}
          <p className="text-muted-foreground text-sm">{t('tags.merge.description', { source: tag?.name || '' })}</p>

          {/* ソースタグ表示 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('tags.merge.sourceTag')}</Label>
            <div className="bg-surface-container flex items-center gap-2 rounded-lg border px-3 py-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: tag?.color || DEFAULT_TAG_COLOR }}
              />
              <span className="text-sm font-medium">{tag?.name}</span>
              <span className="text-muted-foreground text-xs">{tag?.path}</span>
            </div>
          </div>

          {/* ターゲットタグ選択 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('tags.merge.targetTag')}</Label>
            <Select value={targetTagId} onValueChange={setTargetTagId}>
              <SelectTrigger>
                <SelectValue placeholder={t('tags.merge.selectTarget')} />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: t.color || DEFAULT_TAG_COLOR }}
                      />
                      <span>{t.name}</span>
                      <span className="text-muted-foreground text-xs">{t.path}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* オプション */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('tags.merge.options')}</Label>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="merge-associations"
                  checked={mergeAssociations}
                  onCheckedChange={(checked) => setMergeAssociations(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="merge-associations" className="text-sm font-medium">
                    {t('tags.merge.mergeAssociations')}
                  </Label>
                  <p className="text-muted-foreground text-xs">{t('tags.merge.mergeAssociationsDescription')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="delete-source"
                  checked={deleteSource}
                  onCheckedChange={(checked) => setDeleteSource(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="delete-source" className="text-sm font-medium">
                    {t('tags.merge.deleteSource')}
                  </Label>
                  <p className="text-muted-foreground text-xs">{t('tags.merge.deleteSourceDescription')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('tags.merge.warning')}</p>
              {hasChildren && <p className="text-xs opacity-80">{t('tags.merge.warningChildren')}</p>}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={mergeTagMutation.isPending}>{t('tags.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMerge}
            disabled={!targetTagId || mergeTagMutation.isPending}
            className="bg-primary"
          >
            {mergeTagMutation.isPending ? t('tags.merge.merging') : t('tags.merge.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// タグツリーをフラットな配列に変換
function flattenTags(tags: TagWithChildren[]): TagWithChildren[] {
  const result: TagWithChildren[] = []

  function traverse(tagList: TagWithChildren[]) {
    for (const tag of tagList) {
      result.push(tag)
      if (tag.children && tag.children.length > 0) {
        traverse(tag.children)
      }
    }
  }

  traverse(tags)
  return result
}

// 指定されたIDがタグの子孫かどうかをチェック
function isDescendant(tag: TagWithChildren, targetId: string): boolean {
  if (!tag.children) return false

  for (const child of tag.children) {
    if (child.id === targetId) return true
    if (isDescendant(child, targetId)) return true
  }

  return false
}
