'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PlanCard } from '@/features/plans/components/display/PlanCard'
import { usePlans } from '@/features/plans/hooks/usePlans'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import type { Plan } from '@/features/plans/types/plan'
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/features/tags/constants/colors'
import type { TagWithChildren } from '@/features/tags/types'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Folder,
  FolderX,
  Merge,
  MoreHorizontal,
  Palette,
  PanelRight,
  Trash2,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TAG_PRESET_COLORS } from '../../constants/colors'
import { useTagGroups } from '../../hooks/use-tag-groups'
import { useDeleteTag, useTags, useUpdateTag, useUpdateTagColor } from '../../hooks/use-tags'
import { useTagInspectorStore } from '../../stores/useTagInspectorStore'
import { TagArchiveDialog } from '../TagArchiveDialog'
import { TagMergeDialog } from '../TagMergeDialog'
import { TagGroupMenuItems } from './TagGroupDropdown'

/**
 * Tag Inspector（タグ詳細Sheet）
 *
 * - タグ一覧から呼び出し可能
 * - useTagInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 */
export function TagInspector() {
  const { isOpen, entityId: tagId, closeInspector: closeInspectorStore, openInspector } = useTagInspectorStore()
  const { openInspector: openPlanInspector } = usePlanInspectorStore()
  const router = useRouter()
  const pathname = usePathname()

  // Inspectorを閉じる時にURLも更新
  const closeInspector = useCallback(() => {
    closeInspectorStore()
    // /tags/t-123 形式の場合、/tags に戻す
    if (pathname?.match(/\/tags\/t-\d+$/)) {
      const locale = pathname.split('/')[1]
      router.push(`/${locale}/tags`)
    }
  }, [closeInspectorStore, pathname, router])

  // タグデータ取得
  const { data: tags = [], isLoading } = useTags(true)
  const { data: groups = [] } = useTagGroups()

  // 現在のタグを取得
  const tag = useMemo(() => {
    if (!tagId) return null
    // フラット化して検索
    const findTag = (tags: TagWithChildren[]): TagWithChildren | null => {
      for (const t of tags) {
        if (t.id === tagId) return t
        if (t.children) {
          const found = findTag(t.children)
          if (found) return found
        }
      }
      return null
    }
    return findTag(tags)
  }, [tags, tagId])

  // フラット化したタグリスト（ナビゲーション用）
  const flatTags = useMemo(() => {
    const result: TagWithChildren[] = []
    const flatten = (tags: TagWithChildren[]) => {
      for (const t of tags) {
        if (t.is_active) {
          result.push(t)
          if (t.children) flatten(t.children)
        }
      }
    }
    flatten(tags)
    return result
  }, [tags])

  // 現在のタグのインデックス
  const currentIndex = useMemo(() => {
    return flatTags.findIndex((t) => t.id === tagId)
  }, [flatTags, tagId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < flatTags.length - 1

  // タグに紐づくプランを取得
  const { data: plansData = [], isLoading: isLoadingPlans } = usePlans(tag?.id ? { tagId: tag.id } : {}, {
    enabled: !!tag?.id,
  })
  const plans = plansData as unknown as Plan[]

  // 子タグ
  const childTags = useMemo(() => {
    if (!tag) return []
    return tags.filter((t) => t.parent_id === tag.id && t.is_active)
  }, [tags, tag])

  // 親タグ
  const parentTag = useMemo(() => {
    if (!tag?.parent_id) return null
    const findTag = (tags: TagWithChildren[]): TagWithChildren | null => {
      for (const t of tags) {
        if (t.id === tag.parent_id) return t
        if (t.children) {
          const found = findTag(t.children)
          if (found) return found
        }
      }
      return null
    }
    return findTag(tags)
  }, [tags, tag])

  // 所属グループ
  const tagGroup = useMemo(() => {
    if (!tag?.group_id) return null
    return groups.find((g) => g.id === tag.group_id) || null
  }, [groups, tag])

  // Mutations
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()
  const updateColorMutation = useUpdateTagColor()

  // ローカル状態
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  // Title欄のref
  const titleRef = useRef<HTMLSpanElement>(null)
  const descriptionRef = useRef<HTMLSpanElement>(null)

  // デバウンスタイマー
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ナビゲーション
  const goToPrevious = () => {
    if (hasPrevious) {
      const prevTag = flatTags[currentIndex - 1]
      if (prevTag) openInspector(prevTag.id)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      const nextTag = flatTags[currentIndex + 1]
      if (nextTag) openInspector(nextTag.id)
    }
  }

  // 自動保存関数（デバウンス処理付き）
  const autoSave = useCallback(
    (field: 'name' | 'description', value: string) => {
      if (!tagId || !tag) return

      // 値が変更されていない場合はスキップ
      const currentValue = tag[field]
      if (currentValue === value) return

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 新しいタイマーを設定（500ms後に保存）
      debounceTimerRef.current = setTimeout(() => {
        updateTagMutation.mutate({
          id: tagId,
          data: { [field]: value },
        })
      }, 500)
    },
    [tagId, tag, updateTagMutation]
  )

  // カラー変更
  const handleColorChange = useCallback(
    (color: string) => {
      if (!tagId) return
      updateColorMutation.mutate({ id: tagId, color })
      setShowColorPicker(false)
    },
    [tagId, updateColorMutation]
  )

  // 削除ハンドラー
  const handleDelete = useCallback(() => {
    if (!tagId || !tag) return

    if (confirm(`タグ「${tag.name}」を削除しますか？`)) {
      deleteTagMutation.mutate(tagId)
      closeInspector()
    }
  }, [tagId, tag, deleteTagMutation, closeInspector])

  // アーカイブハンドラー
  const handleArchive = useCallback(() => {
    setShowArchiveDialog(true)
  }, [])

  // マージハンドラー
  const handleMerge = useCallback(() => {
    setShowMergeDialog(true)
  }, [])

  // グループ変更ハンドラー
  const handleChangeGroup = useCallback(
    (groupId: string | null) => {
      if (!tagId || !tag) return
      if (tag.group_id === groupId) return
      updateTagMutation.mutate({
        id: tagId,
        data: { group_id: groupId },
      })
    },
    [tagId, tag, updateTagMutation]
  )

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // キーボードショートカット
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力中は無視
      const target = e.target as HTMLElement
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key) {
        case 'Escape':
          closeInspector()
          break
        case 'ArrowUp':
        case 'k':
          if (hasPrevious) {
            e.preventDefault()
            goToPrevious()
          }
          break
        case 'ArrowDown':
        case 'j':
          if (hasNext) {
            e.preventDefault()
            goToNext()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasPrevious, hasNext, closeInspector, goToPrevious, goToNext])

  if (!isOpen) {
    return null
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeInspector()} modal={false}>
        <SheetContent className="gap-0 overflow-y-auto" style={{ width: '480px' }} showCloseButton={false}>
          <SheetTitle className="sr-only">{tag?.name || 'タグの詳細'}</SheetTitle>

          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
            </div>
          ) : !tag ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">タグが見つかりません</p>
            </div>
          ) : (
            <>
              {/* ヘッダー */}
              <div className="flex h-10 items-center justify-between pt-2">
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => closeInspector()}
                          aria-label="閉じる"
                        >
                          <PanelRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>閉じる</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToPrevious}
                            disabled={!hasPrevious}
                            aria-label="前のタグ"
                          >
                            <ChevronUp className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>前のタグ</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToNext}
                            disabled={!hasNext}
                            aria-label="次のタグ"
                          >
                            <ChevronDown className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>次のタグ</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipProvider>

                {/* オプションメニュー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 focus-visible:ring-0"
                      aria-label="オプション"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
                      <Palette className="mr-2 h-4 w-4" />
                      カラー変更
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Folder className="mr-2 h-4 w-4" />
                        グループを変更
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48">
                        <TagGroupMenuItems
                          groups={groups}
                          currentGroupId={tagGroup?.id ?? null}
                          onSelect={handleChangeGroup}
                        />
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={handleMerge}>
                      <Merge className="mr-2 h-4 w-4" />
                      マージ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      アーカイブ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* タグ情報 */}
              <div className="px-6 pt-4 pb-2">
                {/* 親タグへの導線 */}
                {parentTag && (
                  <button
                    onClick={() => openInspector(parentTag.id)}
                    className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm transition-colors"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: parentTag.color || DEFAULT_TAG_COLOR }}
                    />
                    {parentTag.name}
                    <span className="text-muted-foreground/50">/</span>
                  </button>
                )}

                {/* タグ名とカラー */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
                      aria-label="カラー変更"
                    />
                    {/* カラーピッカー */}
                    {showColorPicker && (
                      <div className="bg-popover border-border absolute top-8 left-0 z-50 rounded-lg border p-3 shadow-lg">
                        <div className="grid grid-cols-5 gap-2">
                          {TAG_PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColorChange(color)}
                              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                              style={{ backgroundColor: color }}
                              aria-label={`色を${color}に変更`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => autoSave('name', e.currentTarget.textContent || '')}
                    className="bg-popover flex-1 border-0 px-0 text-2xl font-bold outline-none"
                  >
                    {tag.name}
                  </span>
                  <span className="text-muted-foreground text-sm">t-{tag.tag_number}</span>
                </div>
              </div>

              {/* グループ */}
              <div className="border-border/50 border-t px-6 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-state-hover flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {tagGroup ? (
                          <>
                            <Folder
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: tagGroup.color || DEFAULT_GROUP_COLOR }}
                            />
                            <span className="text-sm">{tagGroup.name}</span>
                          </>
                        ) : (
                          <>
                            <FolderX className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                            <span className="text-muted-foreground text-sm">グループなし</span>
                          </>
                        )}
                      </div>
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <TagGroupMenuItems
                      groups={groups}
                      currentGroupId={tagGroup?.id ?? null}
                      onSelect={handleChangeGroup}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 説明 */}
              <div className="border-border/50 hover:bg-state-hover min-h-[48px] border-t px-6 py-3 transition-colors">
                <div className="flex items-start gap-2">
                  <FileText className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span
                    ref={descriptionRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => autoSave('description', e.currentTarget.textContent || '')}
                    className="text-muted-foreground min-h-[20px] flex-1 text-sm outline-none empty:before:text-gray-400 empty:before:content-['説明を追加...']"
                  >
                    {tag.description || ''}
                  </span>
                </div>
              </div>

              {/* 子タグ */}
              {childTags.length > 0 && (
                <div className="border-border/50 border-t px-6 py-4">
                  <h3 className="text-muted-foreground mb-3 text-sm font-medium">子タグ ({childTags.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {childTags.map((childTag) => (
                      <button
                        key={childTag.id}
                        onClick={() => openInspector(childTag.id)}
                        className="hover:bg-state-hover flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: childTag.color || DEFAULT_TAG_COLOR }}
                        />
                        {childTag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 紐づくプラン */}
              <div className="border-border/50 border-t px-6 py-4">
                <h3 className="text-muted-foreground mb-3 text-sm font-medium">紐づくプラン ({plans.length})</h3>
                {isLoadingPlans ? (
                  <div className="flex h-24 items-center justify-center">
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    このタグに紐づくプランはありません
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {plans.slice(0, 10).map((plan) => (
                      <PlanCard key={plan.id} plan={plan} onClick={(p) => openPlanInspector(p.id)} />
                    ))}
                    {plans.length > 10 && (
                      <p className="text-muted-foreground text-center text-sm">他 {plans.length - 10} 件のプラン</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* アーカイブダイアログ */}
      <TagArchiveDialog
        tag={showArchiveDialog ? tag : null}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={async () => {
          if (!tagId) return
          await updateTagMutation.mutateAsync({
            id: tagId,
            data: { is_active: false },
          })
          setShowArchiveDialog(false)
          closeInspector()
        }}
      />

      {/* マージダイアログ */}
      <TagMergeDialog
        tag={showMergeDialog ? tag : null}
        onClose={() => {
          setShowMergeDialog(false)
          closeInspector()
        }}
      />
    </>
  )
}
