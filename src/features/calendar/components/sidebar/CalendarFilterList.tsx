'use client';

import { useEffect, useMemo } from 'react';

import { ChevronRight, CircleDashed, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { type ItemType, useCalendarFilterStore } from '../../stores/useCalendarFilterStore';

import { SidebarSection } from '@/features/navigation/components/sidebar/SidebarSection';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import { useTags } from '@/features/tags/hooks/useTags';
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';

import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverTooltip } from '@/components/ui/tooltip';
import { api } from '@/lib/trpc';

/** Planのデフォルト色 */
const PLAN_COLOR = '#3b82f6'; // blue-500
/** Recordのデフォルト色 */
const RECORD_COLOR = '#10b981'; // emerald-500

/**
 * カレンダーフィルターリスト
 *
 * Googleカレンダーの「マイカレンダー」のようなUI
 * - 種類: Plan / Record
 * - タグ: グループ別に階層表示
 */
export function CalendarFilterList() {
  const t = useTranslations();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: groups, isLoading: groupsLoading } = useTagGroups();
  const { data: tagStats } = api.plans.getTagStats.useQuery();
  const tagPlanCounts = tagStats?.counts ?? {};

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
  } = useCalendarFilterStore();

  // タグ一覧取得後に初期化
  useEffect(() => {
    if (tags && tags.length > 0) {
      initializeWithTags(tags.map((tag) => tag.id));
    }
  }, [tags, initializeWithTags]);

  // タグをグループ別に整理
  const groupedTags = useMemo(() => {
    if (!tags) return { grouped: [], ungrouped: [] };

    const grouped = (groups || []).map((group) => ({
      group,
      tags: tags.filter((tag) => tag.parent_id === group.id),
    }));

    const ungrouped = tags.filter((tag) => !tag.parent_id);

    return { grouped, ungrouped };
  }, [tags, groups]);

  const isLoading = tagsLoading || groupsLoading;

  return (
    <div className="min-w-0 space-y-2 overflow-hidden p-2">
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
      <SidebarSection
        title={t('calendar.filter.tags')}
        defaultOpen
        className="space-y-1 py-1"
        action={<CreateTagButton />}
      >
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
                    tags={groupTags.map((t) => ({
                      id: t.id,
                      name: t.name,
                      color: t.color || '#3B82F6',
                      description: t.description,
                    }))}
                    visibleTagIds={visibleTagIds}
                    onToggleTag={toggleTag}
                    onToggleGroup={() => toggleGroupTags(groupTags.map((t) => t.id))}
                    groupVisibility={getGroupVisibility(groupTags.map((t) => t.id))}
                    tagPlanCounts={tagPlanCounts}
                  />
                ),
            )}

            {/* グループなしタグ */}
            {groupedTags.ungrouped.length > 0 && (
              <TagGroupSection
                groupName={t('calendar.filter.ungrouped')}
                tags={groupedTags.ungrouped.map((t) => ({
                  id: t.id,
                  name: t.name,
                  color: t.color || '#3B82F6',
                  description: t.description,
                }))}
                visibleTagIds={visibleTagIds}
                onToggleTag={toggleTag}
                onToggleGroup={() => toggleGroupTags(groupedTags.ungrouped.map((t) => t.id))}
                groupVisibility={getGroupVisibility(groupedTags.ungrouped.map((t) => t.id))}
                tagPlanCounts={tagPlanCounts}
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
          <div className="text-muted-foreground px-2 py-2 text-xs">
            {t('calendar.filter.noTags')}
          </div>
        )}
      </SidebarSection>
    </div>
  );
}

/** タググループセクション */
interface TagGroupSectionProps {
  groupName: string;
  groupColor?: string | undefined;
  tags: Array<{ id: string; name: string; color: string; description?: string | null }>;
  visibleTagIds: Set<string>;
  onToggleTag: (tagId: string) => void;
  onToggleGroup: () => void;
  groupVisibility: 'all' | 'none' | 'some';
  tagPlanCounts: Record<string, number>;
}

function TagGroupSection({
  groupName,
  groupColor,
  tags,
  visibleTagIds,
  onToggleTag,
  onToggleGroup,
  groupVisibility,
  tagPlanCounts,
}: TagGroupSectionProps) {
  const groupCheckboxStyle = groupColor
    ? ({
        borderColor: groupColor,
        backgroundColor: groupVisibility === 'all' ? groupColor : 'transparent',
      } as React.CSSProperties)
    : undefined;

  return (
    <Collapsible defaultOpen className="min-w-0">
      <div className="flex min-w-0 items-center">
        {/* グループチェックボックス */}
        <Checkbox
          checked={groupVisibility === 'some' ? 'indeterminate' : groupVisibility === 'all'}
          onCheckedChange={onToggleGroup}
          className="ml-2 size-4"
          style={groupCheckboxStyle}
        />
        {/* 折りたたみトリガー */}
        <CollapsibleTrigger className="hover:bg-state-hover flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded px-2 py-1 text-sm font-medium">
          <span className="min-w-0 truncate">{groupName}</span>
          <ChevronRight className="ml-auto size-4 w-4 shrink-0 transition-transform [[data-state=open]>&]:rotate-90" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="min-w-0 space-y-1 overflow-hidden pl-4">
          {tags.map((tag) => (
            <FilterItem
              key={tag.id}
              label={tag.name}
              tagId={tag.id}
              description={tag.description}
              checkboxColor={tag.color || undefined}
              checked={visibleTagIds.has(tag.id)}
              onCheckedChange={() => onToggleTag(tag.id)}
              count={tagPlanCounts[tag.id] ?? 0}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FilterItemProps {
  label: string;
  /** タグID（クリックでInspector表示用） */
  tagId?: string | undefined;
  /** タグの説明（ツールチップで表示） */
  description?: string | null | undefined;
  /** チェックボックスの色（hex値） */
  checkboxColor?: string | undefined;
  icon?: React.ReactNode;
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** 右端に表示するカウント数 */
  count?: number | undefined;
}

function FilterItem({
  label,
  tagId,
  description,
  checkboxColor,
  icon,
  checked,
  onCheckedChange,
  disabled = false,
  disabledReason,
  count,
}: FilterItemProps) {
  const { openInspector } = useTagInspectorStore();

  // チェックボックスのカスタムスタイル
  const checkboxStyle = checkboxColor
    ? ({
        borderColor: checkboxColor,
        backgroundColor: checked ? checkboxColor : 'transparent',
      } as React.CSSProperties)
    : undefined;

  // 名前クリックでInspectorを開く
  const handleNameClick = (e: React.MouseEvent) => {
    if (tagId && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      openInspector(tagId);
    }
  };

  // 親幅 w-60 (240px) - padding 16px = 224px
  // チェックボックス 16px + gap 8px + 数字用 24px + gap 8px = 56px
  // ラベル最大幅 = 224px - 56px = 168px
  const content = (
    <div
      className={cn(
        'hover:bg-state-hover flex w-full items-center gap-2 rounded px-2 py-1 text-sm',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      title={disabled ? disabledReason : undefined}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="h-4 w-4 shrink-0 cursor-pointer"
        style={checkboxStyle}
      />
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <span
        className={cn(
          'max-w-[140px] truncate',
          tagId && !disabled && 'cursor-pointer hover:underline',
        )}
        onClick={handleNameClick}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground ml-auto w-4 shrink-0 text-right text-xs tabular-nums">
          {count}
        </span>
      )}
    </div>
  );

  // 説明がある場合はツールチップで表示
  return (
    <HoverTooltip content={description} side="right" disabled={!description}>
      {content}
    </HoverTooltip>
  );
}

/** 新規タグ作成ボタン */
function CreateTagButton() {
  const t = useTranslations();
  const { openInspector } = useTagInspectorStore();

  return (
    <HoverTooltip content={t('calendar.filter.createTag')} side="bottom">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex size-6 items-center justify-center rounded"
        onClick={() => openInspector(null)}
      >
        <Plus className="size-4" />
      </button>
    </HoverTooltip>
  );
}
