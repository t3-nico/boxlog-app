'use client'

import { useEffect, useMemo } from 'react'

import { ChevronRight, CircleDashed } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import { type ItemType, useCalendarFilterStore } from '../../stores/useCalendarFilterStore'

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'

import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'

/** Planのデフォルト色 */
const PLAN_COLOR = '#3b82f6' // blue-500
/** Recordのデフォルト色 */
const RECORD_COLOR = '#10b981' // emerald-500

/**
 * カレンダーフィルターリスト
 *
 * Googleカレンダーの「マイカレンダー」のようなUI
 * - 種類: Plan / Record
 * - タグ: グループ別に階層表示
 */
export function CalendarFilterList() {
  const t = useTranslations()
  const { data: tags, isLoading: tagsLoading } = useTags()
  const { data: groups, isLoading: groupsLoading } = useTagGroups()

  const {
    visibleTypes,
    visibleTagIds,
    showUntagged,
    toggleType,
    toggleTag,
    toggleUntagged,
    toggleGroupTags,
    getGroupVisibility,
    initializeWithTags,
  } = useCalendarFilterStore()

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id))
    }
  }, [tags, initializeWithTags])

  // タグをグループ別に整理
  const groupedTags = useMemo(() => {
    if (!tags) return { grouped: [], ungrouped: [] }

    const grouped = (groups || []).map((group) => ({
      group,
      tags: tags.filter((tag) => tag.group_id === group.id),
    }))

    const ungrouped = tags.filter((tag) => !tag.group_id)

    return { grouped, ungrouped }
  }, [tags, groups])

  const isLoading = tagsLoading || groupsLoading

  return (
    <div className="space-y-2 p-2">
      {/* 種類（Plan / Record） */}
      <SidebarSection title={t('calendar.filter.type')} defaultOpen className="space-y-1 py-1">
        <FilterItem
          label="Plan"
          checkboxColor={PLAN_COLOR}
          checked={visibleTypes.plan}
          onCheckedChange={() => toggleType('plan' as ItemType)}
        />
        <FilterItem
          label="Record"
          checkboxColor={RECORD_COLOR}
          checked={visibleTypes.record}
          onCheckedChange={() => toggleType('record' as ItemType)}
          disabled
          disabledReason={t('calendar.filter.comingSoon')}
        />
      </SidebarSection>

      {/* タグ */}
      <SidebarSection title={t('calendar.filter.tags')} defaultOpen className="space-y-1 py-1">
        {isLoading ? (
          <div className="space-y-1 py-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : tags && tags.length > 0 ? (
          <>
            {/* グループ別タグ */}
            {groupedTags.grouped.map(
              ({ group, tags: groupTags }) =>
                groupTags.length > 0 && (
                  <TagGroupSection
                    key={group.id}
                    groupName={group.name}
                    groupColor={group.color || undefined}
                    tags={groupTags}
                    visibleTagIds={visibleTagIds}
                    onToggleTag={toggleTag}
                    onToggleGroup={() => toggleGroupTags(groupTags.map((t) => t.id))}
                    groupVisibility={getGroupVisibility(groupTags.map((t) => t.id))}
                  />
                )
            )}

            {/* グループなしタグ */}
            {groupedTags.ungrouped.length > 0 && (
              <TagGroupSection
                groupName={t('calendar.filter.ungrouped')}
                tags={groupedTags.ungrouped}
                visibleTagIds={visibleTagIds}
                onToggleTag={toggleTag}
                onToggleGroup={() => toggleGroupTags(groupedTags.ungrouped.map((t) => t.id))}
                groupVisibility={getGroupVisibility(groupedTags.ungrouped.map((t) => t.id))}
              />
            )}

            {/* タグなし */}
            <FilterItem
              label={t('calendar.filter.untagged')}
              icon={<CircleDashed className="size-4" />}
              checked={showUntagged}
              onCheckedChange={toggleUntagged}
            />
          </>
        ) : (
          <div className="text-muted-foreground px-2 py-2 text-xs">{t('calendar.filter.noTags')}</div>
        )}
      </SidebarSection>
    </div>
  )
}

/** タググループセクション */
interface TagGroupSectionProps {
  groupName: string
  groupColor?: string | undefined
  tags: Array<{ id: string; name: string; color: string }>
  visibleTagIds: Set<string>
  onToggleTag: (tagId: string) => void
  onToggleGroup: () => void
  groupVisibility: 'all' | 'none' | 'some'
}

function TagGroupSection({
  groupName,
  groupColor,
  tags,
  visibleTagIds,
  onToggleTag,
  onToggleGroup,
  groupVisibility,
}: TagGroupSectionProps) {
  const groupCheckboxStyle = groupColor
    ? ({
        borderColor: groupColor,
        backgroundColor: groupVisibility === 'all' ? groupColor : 'transparent',
      } as React.CSSProperties)
    : undefined

  return (
    <Collapsible defaultOpen>
      <div className="flex items-center">
        {/* グループチェックボックス */}
        <Checkbox
          checked={groupVisibility === 'some' ? 'indeterminate' : groupVisibility === 'all'}
          onCheckedChange={onToggleGroup}
          className="ml-2 size-4"
          style={groupCheckboxStyle}
        />
        {/* 折りたたみトリガー */}
        <CollapsibleTrigger className="hover:bg-state-hover flex flex-1 items-center justify-between rounded px-2 py-1 text-sm font-medium">
          <span className="truncate">{groupName}</span>
          <ChevronRight className="size-4 transition-transform [[data-state=open]>&]:rotate-90" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="space-y-1 pl-4">
          {tags.map((tag) => (
            <FilterItem
              key={tag.id}
              label={tag.name}
              checkboxColor={tag.color || undefined}
              checked={visibleTagIds.has(tag.id)}
              onCheckedChange={() => onToggleTag(tag.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface FilterItemProps {
  label: string
  /** チェックボックスの色（hex値） */
  checkboxColor?: string | undefined
  icon?: React.ReactNode
  checked: boolean
  onCheckedChange: () => void
  disabled?: boolean
  disabledReason?: string
}

function FilterItem({
  label,
  checkboxColor,
  icon,
  checked,
  onCheckedChange,
  disabled = false,
  disabledReason,
}: FilterItemProps) {
  // チェックボックスのカスタムスタイル
  const checkboxStyle = checkboxColor
    ? ({
        borderColor: checkboxColor,
        backgroundColor: checked ? checkboxColor : 'transparent',
      } as React.CSSProperties)
    : undefined

  return (
    <label
      className={cn(
        'hover:bg-state-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      title={disabled ? disabledReason : undefined}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-4 w-4"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="truncate">{label}</span>
    </label>
  )
}
