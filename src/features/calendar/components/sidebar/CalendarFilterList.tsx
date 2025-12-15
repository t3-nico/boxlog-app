'use client'

import { useEffect } from 'react'

import { ChevronRight, CircleDashed } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import { type ItemType, useCalendarFilterStore } from '../../stores/useCalendarFilterStore'

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
 * - マイカレンダー（種類）: Plan / Record
 * - タグ: ユーザーが作成したタグ一覧
 */
export function CalendarFilterList() {
  const t = useTranslations()
  const { data: tags, isLoading: tagsLoading } = useTags()

  const { visibleTypes, visibleTagIds, showUntagged, toggleType, toggleTag, toggleUntagged, initializeWithTags } =
    useCalendarFilterStore()

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id))
    }
  }, [tags, initializeWithTags])

  return (
    <div className="space-y-2">
      {/* マイカレンダー（種類） */}
      <FilterSection title={t('calendar.filter.myCalendars')} defaultOpen>
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
      </FilterSection>

      {/* タグ */}
      <FilterSection title={t('calendar.filter.tags')} defaultOpen>
        {tagsLoading ? (
          <div className="space-y-1.5 py-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : tags && tags.length > 0 ? (
          <>
            {tags.map((tag) => (
              <FilterItem
                key={tag.id}
                label={tag.name}
                checkboxColor={tag.color || undefined}
                checked={visibleTagIds.has(tag.id)}
                onCheckedChange={() => toggleTag(tag.id)}
              />
            ))}
            {/* タグなし */}
            <FilterItem
              label={t('calendar.filter.untagged')}
              icon={<CircleDashed className="h-3 w-3" />}
              checked={showUntagged}
              onCheckedChange={toggleUntagged}
            />
          </>
        ) : (
          <div className="text-muted-foreground px-2 py-2 text-xs">{t('calendar.filter.noTags')}</div>
        )}
      </FilterSection>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="hover:bg-state-hover flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm font-medium">
        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:hidden [[data-state=open]>&]:rotate-90" />
        <span>{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 py-1 pl-2">{children}</div>
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
        'hover:bg-state-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm',
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
