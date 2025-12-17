'use client'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InspectorContent,
  InspectorHeader,
  InspectorShell,
  useInspectorKeyboard,
  type InspectorDisplayMode,
} from '@/features/inspector'
import { PlanCard } from '@/features/plans/components/display/PlanCard'
import { usePlans } from '@/features/plans/hooks/usePlans'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR, TAG_PRESET_COLORS } from '@/features/tags/constants/colors'
import {
  Archive,
  CheckIcon,
  FileText,
  Folder,
  FolderX,
  Merge,
  Palette,
  PanelRight,
  SquareMousePointer,
  Trash2,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTagGroups } from '../../hooks/use-tag-groups'
import { useDeleteTag, useTags, useUpdateTag, useUpdateTagColor } from '../../hooks/use-tags'
import { useTagInspectorStore } from '../../stores/useTagInspectorStore'
import { TagArchiveDialog } from '../TagArchiveDialog'
import { TagDeleteDialog } from '../TagDeleteDialog'
import { TagMergeDialog } from '../TagMergeDialog'
import { TagGroupMenuItems } from './TagGroupDropdown'

/**
 * Tag Inspector（タグ詳細Sheet）
 *
 * 共通Inspector基盤を使用
 * - useTagInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 */
export function TagInspector() {
  const {
    isOpen,
    entityId: tagId,
    displayMode,
    closeInspector: closeInspectorStore,
    openInspector,
    setDisplayMode,
  } = useTagInspectorStore()

  console.log('🔍 TagInspector render:', { isOpen, tagId, displayMode })
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
  const { data: tags = [], isPending } = useTags()
  const { data: groups = [] } = useTagGroups()

  // 現在のタグを取得
  const tag = useMemo(() => {
    if (!tagId) return null
    return tags.find((t) => t.id === tagId) ?? null
  }, [tags, tagId])

  // アクティブなタグリスト（ナビゲーション用）
  const activeTags = useMemo(() => {
    return tags.filter((t) => t.is_active)
  }, [tags])

  // 現在のタグのインデックス
  const currentIndex = useMemo(() => {
    return activeTags.findIndex((t) => t.id === tagId)
  }, [activeTags, tagId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < activeTags.length - 1

  // タグに紐づくプランを取得
  const { data: plans = [], isLoading: isLoadingPlans } = usePlans(tag?.id ? { tagId: tag.id } : {}, {
    enabled: !!tag?.id,
  })

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  // Title欄のref
  const titleRef = useRef<HTMLSpanElement>(null)
  const descriptionRef = useRef<HTMLSpanElement>(null)

  // デバウンスタイマー
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ナビゲーション
  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      const prevTag = activeTags[currentIndex - 1]
      if (prevTag) openInspector(prevTag.id)
    }
  }, [hasPrevious, activeTags, currentIndex, openInspector])

  const goToNext = useCallback(() => {
    if (hasNext) {
      const nextTag = activeTags[currentIndex + 1]
      if (nextTag) openInspector(nextTag.id)
    }
  }, [hasNext, activeTags, currentIndex, openInspector])

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    hasPrevious,
    hasNext,
    onClose: closeInspector,
    onPrevious: goToPrevious,
    onNext: goToNext,
  })

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
    setShowDeleteDialog(true)
  }, [])

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

  // Tag固有のメニュー内容
  const menuContent = (
    <>
      <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
        <Palette className="size-4" />
        カラー変更
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Folder className="size-4" />
          グループを変更
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-48">
          <TagGroupMenuItems groups={groups} currentGroupId={tagGroup?.id ?? null} onSelect={handleChangeGroup} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem onClick={handleMerge}>
        <Merge className="size-4" />
        マージ
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleArchive}>
        <Archive className="size-4" />
        アーカイブ
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="text-muted-foreground px-2 py-2 text-xs font-medium">表示モード</div>
      <button
        type="button"
        onClick={() => setDisplayMode('sheet')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <PanelRight className="size-4 shrink-0" />
          パネル
        </span>
        {displayMode === 'sheet' && <CheckIcon className="text-primary size-4" />}
      </button>
      <button
        type="button"
        onClick={() => setDisplayMode('popover')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <SquareMousePointer className="size-4 shrink-0" />
          ポップアップ
        </span>
        {displayMode === 'popover' && <CheckIcon className="text-primary size-4" />}
      </button>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  )

  return (
    <>
      <InspectorShell
        isOpen={isOpen}
        onClose={closeInspector}
        displayMode={displayMode as InspectorDisplayMode}
        title={tag?.name || 'タグの詳細'}
        resizable={true}
        modal={false}
      >
        <InspectorContent isLoading={isPending} hasData={!!tag} emptyMessage="タグが見つかりません">
          {tag && (
            <div className="flex h-full flex-col overflow-hidden">
              {/* ヘッダー */}
              <InspectorHeader
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onClose={closeInspector}
                onPrevious={goToPrevious}
                onNext={goToNext}
                previousLabel="前のタグ"
                nextLabel="次のタグ"
                displayMode={displayMode as InspectorDisplayMode}
                menuContent={menuContent}
              />

              {/* タグ名とカラー */}
              <div className="flex min-h-10 items-start gap-2 px-4 py-2">
                <div className="relative mt-1.5">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="size-4 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
                    aria-label="カラー変更"
                  />
                  {/* カラーピッカー */}
                  {showColorPicker && (
                    <div className="bg-popover border-border absolute top-6 left-0 z-20 rounded-lg border p-3 shadow-lg">
                      <div className="grid grid-cols-5 gap-2">
                        {TAG_PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className="size-5 rounded-full transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                            aria-label={`色を${color}に変更`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex min-h-8 flex-1 items-center">
                  <span
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => autoSave('name', e.currentTarget.textContent || '')}
                    className="bg-popover border-0 px-0 text-lg font-semibold outline-none"
                  >
                    {tag.name}
                  </span>
                  <span className="text-muted-foreground ml-2 text-sm">t-{tag.tag_number}</span>
                </div>
              </div>

              {/* グループ */}
              <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
                {tagGroup ? (
                  <Folder
                    className="mt-2 size-4 flex-shrink-0"
                    style={{ color: tagGroup.color || DEFAULT_GROUP_COLOR }}
                  />
                ) : (
                  <FolderX className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
                )}
                <div className="flex min-h-8 flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      /* グループ選択メニューを表示 */
                    }}
                    className="text-muted-foreground hover:bg-state-hover h-8 rounded-md px-2 text-sm transition-colors"
                  >
                    {tagGroup ? tagGroup.name : 'グループを選択...'}
                  </button>
                </div>
              </div>

              {/* 説明 */}
              <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
                <FileText className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
                <div className="min-h-8 min-w-0 flex-1">
                  <span
                    ref={descriptionRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      const text = e.currentTarget.textContent || ''
                      if (text.length > 100) {
                        e.currentTarget.textContent = text.slice(0, 100)
                        // カーソルを末尾に移動
                        const range = document.createRange()
                        const selection = window.getSelection()
                        range.selectNodeContents(e.currentTarget)
                        range.collapse(false)
                        selection?.removeAllRanges()
                        selection?.addRange(range)
                        // 制限通知
                        toast.info('説明は100文字までです', {
                          id: 'description-limit',
                        })
                      }
                    }}
                    onBlur={(e) => autoSave('description', e.currentTarget.textContent || '')}
                    className="text-muted-foreground empty:before:text-muted-foreground/60 block min-h-8 w-full pt-1.5 text-sm break-words outline-none empty:before:content-['説明を追加...']"
                    style={{ overflowWrap: 'anywhere' }}
                  >
                    {tag.description || ''}
                  </span>
                </div>
              </div>

              {/* 紐づくプラン */}
              <div className="border-border/50 flex-1 overflow-y-auto border-t px-4 py-2">
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">紐づくプラン ({plans.length})</h3>
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <PlanCard key={plan.id} plan={plan as any} onClick={(p) => openPlanInspector(p.id)} />
                    ))}
                    {plans.length > 10 && (
                      <p className="text-muted-foreground text-center text-sm">他 {plans.length - 10} 件のプラン</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </InspectorContent>
      </InspectorShell>

      {/* 削除ダイアログ */}
      <TagDeleteDialog
        tag={showDeleteDialog ? tag : null}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          if (!tagId) return
          await deleteTagMutation.mutateAsync(tagId)
          setShowDeleteDialog(false)
          closeInspector()
        }}
      />

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
