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
import type { TagWithChildren } from '@/types/tags'
import { AlertTriangle, GitMerge } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface TagBulkMergeDialogProps {
  /** マージ対象のタグ（2つ以上） */
  sourceTags: TagWithChildren[]
  onClose: () => void
}

/**
 * 複数タグの一括マージダイアログ
 *
 * 選択された複数のタグを1つのタグに統合する
 */
export function TagBulkMergeDialog({ sourceTags, onClose }: TagBulkMergeDialogProps) {
  const t = useTranslations()
  const [targetTagId, setTargetTagId] = useState<string>('')
  const [mergeAssociations, setMergeAssociations] = useState(true)
  const [deleteSource, setDeleteSource] = useState(true)
  const [isMerging, setIsMerging] = useState(false)

  const { data: tags = [] } = useTags()
  const mergeTagMutation = useMergeTag()

  const isOpen = sourceTags.length >= 2

  // 選択されたタグ以外のすべてのタグ + 選択されたタグ自身（マージ先として選択可能）
  const availableTags = flattenTags(tags).filter((t) => {
    // 選択されたタグの子孫は除外（循環を防ぐ）
    for (const sourceTag of sourceTags) {
      if (isDescendant(sourceTag, t.id)) return false
    }
    return true
  })

  // 選択されたタグをマージ先候補として優先表示
  const selectedTagsAsTargets = sourceTags
  const otherTags = availableTags.filter((t) => !sourceTags.some((s) => s.id === t.id))

  const handleMerge = async () => {
    if (!targetTagId || sourceTags.length < 2) {
      toast.error(t('tags.merge.noTargetSelected'))
      return
    }

    setIsMerging(true)

    try {
      // ターゲット以外のソースタグをすべてマージ
      const tagsToMerge = sourceTags.filter((tag) => tag.id !== targetTagId)
      let totalMerged = 0

      for (const sourceTag of tagsToMerge) {
        const result = await mergeTagMutation.mutateAsync({
          sourceTagId: sourceTag.id,
          targetTagId,
          mergeAssociations,
          deleteSource,
        })
        totalMerged += result.merged_associations || 0
      }

      const targetTag = availableTags.find((t) => t.id === targetTagId)
      toast.success(
        t('tags.bulkMerge.success', {
          count: tagsToMerge.length,
          target: targetTag?.name || '',
          associations: totalMerged,
        })
      )
      onClose()
    } catch (error) {
      console.error('Bulk merge failed:', error)
      toast.error(t('tags.merge.failed'))
    } finally {
      setIsMerging(false)
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

  // マージされるタグ（ターゲット以外）
  const tagsToMerge = sourceTags.filter((tag) => tag.id !== targetTagId)

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            {t('tags.bulkMerge.title')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* 説明 */}
          <p className="text-muted-foreground text-sm">
            {t('tags.bulkMerge.description', { count: sourceTags.length })}
          </p>

          {/* 選択されたタグ一覧 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('tags.bulkMerge.selectedTags')}</Label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border p-2">
              {sourceTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                    tag.id === targetTagId ? 'bg-primary/10 font-medium' : ''
                  }`}
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
                  />
                  <span>{tag.name}</span>
                  {tag.id === targetTagId && (
                    <span className="text-primary text-xs">← {t('tags.bulkMerge.mergeTarget')}</span>
                  )}
                </div>
              ))}
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
                {/* 選択されたタグを優先表示 */}
                {selectedTagsAsTargets.length > 0 && (
                  <>
                    <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                      {t('tags.bulkMerge.selectedTagsGroup')}
                    </div>
                    {selectedTagsAsTargets.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: t.color || DEFAULT_TAG_COLOR }}
                          />
                          <span>{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {/* その他のタグ */}
                {otherTags.length > 0 && (
                  <>
                    <div className="text-muted-foreground mt-1 px-2 py-1 text-xs font-medium">
                      {t('tags.bulkMerge.otherTagsGroup')}
                    </div>
                    {otherTags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: t.color || DEFAULT_TAG_COLOR }}
                          />
                          <span>{t.name}</span>
                          {t.path && <span className="text-muted-foreground text-xs">{t.path}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* オプション */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('tags.merge.options')}</Label>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="bulk-merge-associations"
                  checked={mergeAssociations}
                  onCheckedChange={(checked) => setMergeAssociations(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="bulk-merge-associations" className="text-sm font-medium">
                    {t('tags.merge.mergeAssociations')}
                  </Label>
                  <p className="text-muted-foreground text-xs">{t('tags.merge.mergeAssociationsDescription')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="bulk-delete-source"
                  checked={deleteSource}
                  onCheckedChange={(checked) => setDeleteSource(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="bulk-delete-source" className="text-sm font-medium">
                    {t('tags.merge.deleteSource')}
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    {t('tags.bulkMerge.deleteSourceDescription', { count: tagsToMerge.length })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-2 rounded-lg border p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('tags.merge.warning')}</p>
              <p className="text-xs opacity-80">{t('tags.bulkMerge.warningDetail', { count: tagsToMerge.length })}</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isMerging}>{t('tags.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleMerge} disabled={!targetTagId || isMerging} className="bg-primary">
            {isMerging ? t('tags.merge.merging') : t('tags.bulkMerge.confirm', { count: tagsToMerge.length })}
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
