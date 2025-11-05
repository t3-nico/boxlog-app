'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { api } from '@/lib/trpc'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface BulkTagsDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** 開閉状態を変更するコールバック */
  onOpenChange: (open: boolean) => void
  /** 選択されたチケットIDの配列 */
  selectedIds: string[]
  /** 成功時のコールバック */
  onSuccess?: () => void
}

/**
 * タグ一括編集ダイアログ
 *
 * 選択された複数のチケットに対してタグの追加/削除を一括で行う
 * - タブで「追加」「削除」を切り替え
 * - タグ検索機能
 * - 選択したタグをバッジ表示
 *
 * @example
 * ```tsx
 * <BulkTagsDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   selectedIds={['id1', 'id2']}
 *   onSuccess={() => console.log('Success')}
 * />
 * ```
 */
export function BulkTagsDialog({ open, onOpenChange, selectedIds, onSuccess }: BulkTagsDialogProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { bulkUpdateTicket } = useTicketMutations()

  // タグ一覧を取得
  const { data: allTags = [], isLoading: isLoadingTags } = api.tickets.tags.list.useQuery()

  // タグ選択トグル
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  // タグ削除
  const removeTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
  }

  // 送信ハンドラー
  const handleSubmit = async () => {
    if (selectedTagIds.length === 0) {
      toast.error('タグを選択してください')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: 一括タグ追加/削除のAPI実装が必要
      // 現在はステータス更新のみ対応しているため、将来的に拡張

      if (mode === 'add') {
        // タグ追加ロジック
        toast.info('タグの一括追加機能は開発中です')
      } else {
        // タグ削除ロジック
        toast.info('タグの一括削除機能は開発中です')
      }

      onSuccess?.()
    } catch (error) {
      toast.error('タグの編集に失敗しました')
      console.error('Bulk tag edit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    setSelectedTagIds([])
    setMode('add')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>タグ一括編集</DialogTitle>
          <DialogDescription>{selectedIds.length}件のチケットにタグを編集します</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'add' | 'remove')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">追加</TabsTrigger>
            <TabsTrigger value="remove">削除</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <div className="text-muted-foreground text-sm">選択したチケットにタグを追加します</div>

            {/* 選択されたタグ */}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTagIds.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId)
                  return (
                    <Badge key={tagId} variant="secondary" className="gap-1">
                      {tag?.name || tagId}
                      <button
                        type="button"
                        onClick={() => removeTag(tagId)}
                        className="hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* タグ選択 */}
            <Command className="border-input rounded-lg border">
              <CommandInput placeholder="タグを検索..." />
              <CommandList>
                {isLoadingTags ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>タグが見つかりません</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                          <div className="flex w-full items-center justify-between">
                            <span>{tag.name}</span>
                            {selectedTagIds.includes(tag.id) && <Check className="size-4" />}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4">
            <div className="text-muted-foreground text-sm">選択したチケットからタグを削除します</div>

            {/* 選択されたタグ */}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTagIds.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId)
                  return (
                    <Badge key={tagId} variant="destructive" className="gap-1">
                      {tag?.name || tagId}
                      <button
                        type="button"
                        onClick={() => removeTag(tagId)}
                        className="hover:bg-destructive/80 rounded-full transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* タグ選択 */}
            <Command className="border-input rounded-lg border">
              <CommandInput placeholder="タグを検索..." />
              <CommandList>
                {isLoadingTags ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>タグが見つかりません</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem key={tag.id} onSelect={() => toggleTag(tag.id)}>
                          <div className="flex w-full items-center justify-between">
                            <span>{tag.name}</span>
                            {selectedTagIds.includes(tag.id) && <Check className="size-4" />}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedTagIds.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                処理中...
              </>
            ) : mode === 'add' ? (
              <>
                <Plus className="mr-2 size-4" />
                追加
              </>
            ) : (
              <>
                <X className="mr-2 size-4" />
                削除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
