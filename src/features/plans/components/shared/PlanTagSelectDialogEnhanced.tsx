'use client'

import { Archive, Folder, FolderX, Hash, PanelLeftClose, PanelLeftOpen, Plus, Search, Tags, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useCreateTag, useTags } from '@/features/tags/hooks/use-tags'
import type { Tag as TagType } from '@/features/tags/types'
import { api } from '@/lib/trpc'

interface PlanTagSelectDialogEnhancedProps {
  children: React.ReactNode
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  align?: 'start' | 'center' | 'end' | undefined
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined
  alignOffset?: number | undefined
  sideOffset?: number | undefined
}

export function PlanTagSelectDialogEnhanced({
  children,
  selectedTagIds,
  onTagsChange,
  align = 'start',
  side = 'bottom',
  alignOffset = 0,
  sideOffset = 8,
}: PlanTagSelectDialogEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const { data: tagsData } = useTags(true)
  const { data: groups = [] } = useTagGroups()
  const createTagMutation = useCreateTag()
  const { data: tagplanCounts = {} } = api.plans.getTagPlanCounts.useQuery()

  const allTags = tagsData ?? []

  // フィルタリング
  const filteredTags = useMemo(() => {
    let filtered = allTags

    // アクティブ/アーカイブフィルタ
    if (!showArchived) {
      filtered = filtered.filter((tag) => tag.is_active)
    } else {
      filtered = filtered.filter((tag) => !tag.is_active)
    }

    // グループフィルタ
    if (selectedGroupId === 'uncategorized') {
      filtered = filtered.filter((tag) => !tag.group_id)
    } else if (selectedGroupId) {
      filtered = filtered.filter((tag) => tag.group_id === selectedGroupId)
    }

    // 検索フィルタ
    if (searchQuery) {
      filtered = filtered.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return filtered
  }, [allTags, showArchived, selectedGroupId, searchQuery])

  // 選択済み・未選択タグに分割
  const selectedTags = useMemo(() => {
    return filteredTags.filter((tag) => selectedTagIds.includes(tag.id))
  }, [filteredTags, selectedTagIds])

  const unselectedTags = useMemo(() => {
    return filteredTags.filter((tag) => !selectedTagIds.includes(tag.id))
  }, [filteredTags, selectedTagIds])

  // タグの選択/解除
  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  // 全選択/全解除
  const handleToggleAll = () => {
    const activeFilteredTagIds = filteredTags.filter((tag) => tag.is_active).map((tag) => tag.id)

    if (activeFilteredTagIds.length === 0) return

    const allSelected = activeFilteredTagIds.every((id) => selectedTagIds.includes(id))

    if (allSelected) {
      // 全解除: フィルタされたタグを選択から除外
      onTagsChange(selectedTagIds.filter((id) => !activeFilteredTagIds.includes(id)))
    } else {
      // 全選択: フィルタされたタグを選択に追加（重複除外）
      const newSelection = [...new Set([...selectedTagIds, ...activeFilteredTagIds])]
      onTagsChange(newSelection)
    }
  }

  // チェックボックスの状態を計算
  const getCheckboxState = (): boolean | 'indeterminate' => {
    const activeFilteredTagIds = filteredTags.filter((tag) => tag.is_active).map((tag) => tag.id)
    if (activeFilteredTagIds.length === 0) return false

    const selectedCount = activeFilteredTagIds.filter((id) => selectedTagIds.includes(id)).length

    if (selectedCount === 0) return false
    if (selectedCount === activeFilteredTagIds.length) return true
    return 'indeterminate'
  }

  const checkboxState = getCheckboxState()

  // タグ作成
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const createdTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: DEFAULT_TAG_COLOR,
        description: undefined,
        group_id: selectedGroupId && selectedGroupId !== 'uncategorized' ? selectedGroupId : undefined,
      })

      if (createdTag && createdTag.id) {
        onTagsChange([...selectedTagIds, createdTag.id])
      }

      setNewTagName('')
      setIsCreating(false)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  // Enter キーでタグ作成
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateTag()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewTagName('')
    }
  }

  // グループごとのタグ数
  const getGroupTagCount = (groupId: string) => {
    return allTags.filter((tag) => tag.group_id === groupId && tag.is_active).length
  }

  // 未分類タグ数
  const uncategorizedCount = allTags.filter((tag) => !tag.group_id && tag.is_active).length

  // アーカイブ数
  const archivedCount = allTags.filter((tag) => !tag.is_active).length

  // アクティブタグ数
  const activeCount = allTags.filter((tag) => tag.is_active).length

  // Popoverを閉じた時に状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')

      setIsCreating(false)

      setNewTagName('')

      setSelectedGroupId(null)

      setShowArchived(false)

      setShowSidebar(true)
    }
  }, [isOpen])

  return (
    <Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="!border-border bg-popover dark:bg-popover flex flex-col gap-0 !border p-0"
        style={{ width: '720px', maxWidth: 'calc(100vw - 160px)', height: '50vh', maxHeight: '80vh' }}
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={true}
        collisionPadding={{ left: 80, right: 80, top: 20, bottom: 20 }}
      >
        {/* ヘッダー: 検索バー + 新規作成ボタン */}
        <div className="border-border shrink-0 border-b p-4">
          <div className="flex items-center gap-3">
            {/* 検索バー（flex-1で拡張） */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="タグを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>

            {/* 新規作成ボタン */}
            <Button variant="default" size="sm" onClick={() => setIsCreating(!isCreating)} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              新しいタグ
            </Button>

            {/* サイドバー開閉ボタン */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="hidden shrink-0 md:flex"
                  >
                    {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showSidebar ? 'サイドバーを閉じる' : 'サイドバーを開く'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 作成フォーム（isCreating時のみ表示） */}
          {isCreating && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="タグ名を入力..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                作成
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* 左側: Sidebar (モバイルでは非表示) */}
          {showSidebar && (
            <div
              className="border-border hidden shrink-0 border-r md:block"
              style={{ width: '240px', maxWidth: '240px' }}
            >
              <ScrollArea className="h-full">
                <nav className="flex flex-col gap-0 p-2" style={{ maxWidth: '240px' }}>
                  {/* すべてのタグ */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupId(null)
                      setShowArchived(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      !selectedGroupId && !showArchived
                        ? 'bg-state-selected text-foreground'
                        : 'text-muted-foreground hover:bg-state-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">すべてのタグ</span>
                      <span className="text-muted-foreground shrink-0">{activeCount}</span>
                    </div>
                  </button>

                  {/* 未分類 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupId('uncategorized')
                      setShowArchived(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      selectedGroupId === 'uncategorized' && !showArchived
                        ? 'bg-state-selected text-foreground'
                        : 'text-muted-foreground hover:bg-state-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderX className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <span className="flex-1 truncate">未分類</span>
                      <span className="text-muted-foreground shrink-0">{uncategorizedCount}</span>
                    </div>
                  </button>

                  {/* アーカイブ */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupId(null)
                      setShowArchived(true)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      showArchived ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">アーカイブ</span>
                      <span className="text-muted-foreground shrink-0">{archivedCount}</span>
                    </div>
                  </button>

                  {/* グループセクション */}
                  {groups.length > 0 && (
                    <>
                      <div className="text-muted-foreground mt-4 mb-2 pr-1 pl-3 text-xs font-semibold uppercase">
                        グループ
                      </div>
                      {groups.map((group) => {
                        const groupTagCount = getGroupTagCount(group.id)
                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setSelectedGroupId(group.id)
                              setShowArchived(false)
                            }}
                            className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                              selectedGroupId === group.id && !showArchived
                                ? 'bg-state-selected text-foreground'
                                : 'text-muted-foreground hover:bg-state-hover'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 shrink-0" style={{ color: group.color || '#6B7280' }} />
                              <span className="flex-1 truncate">{group.name}</span>
                              <span className="text-muted-foreground shrink-0">{groupTagCount}</span>
                            </div>
                          </button>
                        )
                      })}
                    </>
                  )}
                </nav>
              </ScrollArea>
            </div>
          )}

          {/* 右側: メインコンテンツ */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* テーブル */}
            <ScrollArea className="flex-1">
              {filteredTags.length === 0 ? (
                <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                  {searchQuery ? 'タグが見つかりません' : 'タグがありません'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs">
                        <Checkbox checked={checkboxState} onCheckedChange={handleToggleAll} aria-label="すべて選択" />
                      </TableHead>
                      <TableHead className="w-8 text-xs"></TableHead>
                      <TableHead className="w-60 text-xs">名前</TableHead>
                      <TableHead className="text-xs">説明</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 選択済みセクション */}
                    {selectedTags.length > 0 && (
                      <>
                        <TableRow className="bg-surface-container/30 hover:bg-state-hover">
                          <TableCell colSpan={4} className="py-2 text-xs font-semibold">
                            選択中 ({selectedTags.length})
                          </TableCell>
                        </TableRow>
                        {selectedTags.map((tag) => {
                          const isSelected = true
                          return (
                            <TableRow
                              key={tag.id}
                              className={`cursor-pointer text-xs ${!tag.is_active ? 'opacity-50' : ''} ${
                                isSelected ? 'bg-primary/10' : ''
                              }`}
                              onClick={() => tag.is_active && handleToggleTag(tag.id)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => tag.is_active && handleToggleTag(tag.id)}
                                  disabled={!tag.is_active}
                                  aria-label={`${tag.name}を選択`}
                                />
                              </TableCell>
                              <TableCell className="pr-1">
                                <Hash
                                  className="h-4 w-4"
                                  style={{ color: tag.color || '#3B82F6' }}
                                  aria-label="タグカラー"
                                />
                              </TableCell>
                              <TableCell className="pl-1 font-medium">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {tag.name}{' '}
                                    <span className="text-muted-foreground">({tagplanCounts[tag.id] || 0})</span>
                                  </span>
                                  {!tag.is_active && (
                                    <Badge variant="outline" className="text-xs">
                                      アーカイブ済み
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                <span className="line-clamp-2">{tag.description || '-'}</span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </>
                    )}

                    {/* 未選択セクション */}
                    {unselectedTags.length > 0 && (
                      <>
                        <TableRow className="bg-surface-container/30 hover:bg-state-hover">
                          <TableCell colSpan={4} className="py-2 text-xs font-semibold">
                            その他
                          </TableCell>
                        </TableRow>
                        {unselectedTags.map((tag) => {
                          const isSelected = false
                          return (
                            <TableRow
                              key={tag.id}
                              className={`cursor-pointer text-xs ${!tag.is_active ? 'opacity-50' : ''}`}
                              onClick={() => tag.is_active && handleToggleTag(tag.id)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => tag.is_active && handleToggleTag(tag.id)}
                                  disabled={!tag.is_active}
                                  aria-label={`${tag.name}を選択`}
                                />
                              </TableCell>
                              <TableCell className="pr-1">
                                <Hash
                                  className="h-4 w-4"
                                  style={{ color: tag.color || '#3B82F6' }}
                                  aria-label="タグカラー"
                                />
                              </TableCell>
                              <TableCell className="pl-1 font-medium">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {tag.name}{' '}
                                    <span className="text-muted-foreground">({tagplanCounts[tag.id] || 0})</span>
                                  </span>
                                  {!tag.is_active && (
                                    <Badge variant="outline" className="text-xs">
                                      アーカイブ済み
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                <span className="line-clamp-2">{tag.description || '-'}</span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </>
                    )}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
