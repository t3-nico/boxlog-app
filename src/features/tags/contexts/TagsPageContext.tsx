'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Folder } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useReorderTagGroups, useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useUpdateTag } from '@/features/tags/hooks/use-tags'
import type { TagGroup, TagWithChildren } from '@/types/tags'

interface TagsPageContextValue {
  tags: TagWithChildren[]
  setTags: (tags: TagWithChildren[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  isCreatingGroup: boolean
  setIsCreatingGroup: (creating: boolean) => void
  isCreatingTag: boolean
  setIsCreatingTag: (creating: boolean) => void
  // ドラッグ中のタグ
  draggingTag: TagWithChildren | null
  // グループソート用
  activeGroup: TagGroup | null
  reorderedGroups: TagGroup[]
  sortableContextProps: {
    items: string[]
    strategy: typeof verticalListSortingStrategy
  }
}

const TagsPageContext = createContext<TagsPageContextValue | null>(null)

export function useTagsPageContext() {
  const context = useContext(TagsPageContext)
  if (!context) {
    throw new Error('useTagsPageContext must be used within TagsPageProvider')
  }
  return context
}

interface TagsPageProviderProps {
  children: ReactNode
}

export function TagsPageProvider({ children }: TagsPageProviderProps) {
  const [tags, setTags] = useState<TagWithChildren[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [draggingTag, setDraggingTag] = useState<TagWithChildren | null>(null)

  // グループソート用の状態
  const { data: groups = [] as TagGroup[] } = useTagGroups()
  const [activeGroup, setActiveGroup] = useState<TagGroup | null>(null)
  const [localGroups, setLocalGroups] = useState<TagGroup[]>(groups)
  const reorderMutation = useReorderTagGroups()
  const prevGroupIdsRef = useRef<string>(groups.map((g) => g.id).join(','))

  const updateTagMutation = useUpdateTag()

  // センサー設定（タグとグループの両方に対応）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // グループIDが変わった時のみlocalGroupsを更新
  const currentGroupIds = groups.map((g) => g.id).join(',')
  useEffect(() => {
    if (currentGroupIds !== prevGroupIdsRef.current && !activeGroup) {
      prevGroupIdsRef.current = currentGroupIds
      setLocalGroups(groups)
    }
  }, [currentGroupIds, groups, activeGroup])

  // ドラッグ開始
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event

      // タグのドラッグ
      if (active.data.current?.type === 'tag') {
        const tag = tags.find((t) => t.id === active.id)
        if (tag) {
          setDraggingTag(tag)
        }
        return
      }

      // グループのドラッグ（ソート用）
      const group = localGroups.find((g) => g.id === active.id)
      if (group) {
        setActiveGroup(group)
      }
    },
    [tags, localGroups]
  )

  // ドラッグ終了
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      // タグのドラッグ終了
      if (draggingTag) {
        setDraggingTag(null)

        if (!over) return

        // タグをグループにドロップ
        if (over.data.current?.type === 'group') {
          const tagId = active.id as string
          // over.id が 'drop-xxx' 形式の場合は groupId を取得、そうでなければ null
          const groupId = over.data.current.groupId as string | null
          const tag = tags.find((t) => t.id === tagId)

          if (tag && tag.group_id !== groupId) {
            try {
              await updateTagMutation.mutateAsync({
                id: tagId,
                data: { group_id: groupId },
              })
              const targetGroup = groupId ? localGroups.find((g) => g.id === groupId) : null
              const groupName = targetGroup?.name ?? '未分類'
              toast.success(`「${tag.name}」を${groupName}に移動しました`)
            } catch (error) {
              console.error('Failed to move tag:', error)
              toast.error('タグの移動に失敗しました')
            }
          }
        }
        return
      }

      // グループのドラッグ終了（ソート）
      if (activeGroup) {
        setActiveGroup(null)

        if (!over || active.id === over.id) return

        const oldIndex = localGroups.findIndex((g) => g.id === active.id)
        const newIndex = localGroups.findIndex((g) => g.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        // 楽観的更新
        const reordered = arrayMove(localGroups, oldIndex, newIndex)
        setLocalGroups(reordered)

        // APIに反映
        const groupIds = reordered.map((g) => g.id)
        reorderMutation.mutate(groupIds, {
          onError: () => {
            // エラー時はロールバック
            setLocalGroups(groups)
          },
        })
      }
    },
    [draggingTag, activeGroup, tags, localGroups, groups, updateTagMutation, reorderMutation]
  )

  // ドラッグキャンセル
  const handleDragCancel = useCallback(() => {
    setDraggingTag(null)
    setActiveGroup(null)
  }, [])

  // SortableContext用のprops
  const sortableContextProps = {
    items: localGroups.map((g) => g.id),
    strategy: verticalListSortingStrategy,
  }

  return (
    <TagsPageContext.Provider
      value={{
        tags,
        setTags,
        isLoading,
        setIsLoading,
        isCreatingGroup,
        setIsCreatingGroup,
        isCreatingTag,
        setIsCreatingTag,
        draggingTag,
        activeGroup,
        reorderedGroups: localGroups,
        sortableContextProps,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay>
          {draggingTag && (
            <div className="bg-card border-border flex items-center gap-2 rounded-md border px-3 py-2 shadow-lg">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: draggingTag.color || DEFAULT_TAG_COLOR }}
              />
              <span className="text-sm font-medium">{draggingTag.name}</span>
            </div>
          )}
          {activeGroup && (
            <div className="bg-foreground/12 text-foreground w-48 rounded-md px-3 py-2 text-left text-sm opacity-80 shadow-lg">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 shrink-0" style={{ color: activeGroup.color || DEFAULT_GROUP_COLOR }} />
                <span className="flex-1 truncate">{activeGroup.name}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </TagsPageContext.Provider>
  )
}
