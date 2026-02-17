'use client';

import { ArrowUpDown, Calendar, Group, RotateCcw, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';

/** Record ソートフィールド */
export type RecordPanelSortField =
  | 'worked_at'
  | 'duration_minutes'
  | 'fulfillment_score'
  | 'created_at'
  | 'updated_at';

/** ソート方向 */
export type RecordPanelSortOrder = 'asc' | 'desc';

/** Record グルーピングフィールド */
export type RecordPanelGroupByField = 'worked_at' | 'tags' | 'fulfillment_score' | null;

/** Record 日付フィルター */
export type RecordPanelDateFilter = 'all' | 'today' | 'this_week' | 'this_month';

interface RecordListSortMenuProps {
  sortBy: RecordPanelSortField;
  sortOrder: RecordPanelSortOrder;
  groupBy: RecordPanelGroupByField;
  dateFilter: RecordPanelDateFilter;
  onSortChange: (field: RecordPanelSortField, order: RecordPanelSortOrder) => void;
  onGroupByChange: (field: RecordPanelGroupByField) => void;
  onDateFilterChange: (filter: RecordPanelDateFilter) => void;
}

/**
 * アサイド用の Record ソート/フィルターメニュー
 *
 * PlanListSortMenu と同構造。
 * Record 固有: ステータスなし / スケジュールフィルターなし → 代わりに日付フィルターあり
 */
export function RecordListSortMenu({
  sortBy,
  sortOrder,
  groupBy,
  dateFilter,
  onSortChange,
  onGroupByChange,
  onDateFilterChange,
}: RecordListSortMenuProps) {
  const t = useTranslations('calendar');

  const sortOptions: Array<{ value: RecordPanelSortField; label: string }> = [
    { value: 'worked_at', label: t('aside.recordSort.workedAt') },
    { value: 'duration_minutes', label: t('aside.recordSort.durationMinutes') },
    { value: 'fulfillment_score', label: t('aside.recordSort.fulfillmentScore') },
    { value: 'created_at', label: t('aside.recordSort.createdAt') },
    { value: 'updated_at', label: t('aside.recordSort.updatedAt') },
  ];

  const groupOptions: Array<{ value: RecordPanelGroupByField; label: string }> = [
    { value: null, label: t('aside.recordGroup.none') },
    { value: 'worked_at', label: t('aside.recordGroup.workedAt') },
    { value: 'tags', label: t('aside.recordGroup.tags') },
    { value: 'fulfillment_score', label: t('aside.recordGroup.fulfillmentScore') },
  ];

  const dateFilterOptions: Array<{ value: RecordPanelDateFilter; label: string }> = [
    { value: 'all', label: t('aside.recordDateFilter.all') },
    { value: 'today', label: t('aside.recordDateFilter.today') },
    { value: 'this_week', label: t('aside.recordDateFilter.thisWeek') },
    { value: 'this_month', label: t('aside.recordDateFilter.thisMonth') },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? '';
  const currentGroupLabel = groupOptions.find((o) => o.value === groupBy)?.label ?? '';
  const currentDateFilterLabel = dateFilterOptions.find((o) => o.value === dateFilter)?.label ?? '';

  const isActive =
    sortBy !== 'worked_at' || sortOrder !== 'desc' || groupBy !== null || dateFilter !== 'all';

  const handleReset = () => {
    onSortChange('worked_at', 'desc');
    onGroupByChange(null);
    onDateFilterChange('all');
  };

  return (
    <DropdownMenu>
      <HoverTooltip content={t('aside.sortBy')} side="top">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" icon aria-label={t('aside.sortBy')}>
            <Settings2 className={isActive ? 'text-foreground size-4' : 'size-4'} />
          </Button>
        </DropdownMenuTrigger>
      </HoverTooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          {/* 並べ替え */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowUpDown />
              <span className="flex-1">{t('aside.sortBy')}</span>
              <span className="text-muted-foreground text-xs">{currentSortLabel}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => onSortChange(value as RecordPanelSortField, sortOrder)}
              >
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(value) => onSortChange(sortBy, value as RecordPanelSortOrder)}
              >
                <DropdownMenuRadioItem value="asc">
                  {t('aside.recordSort.asc')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">
                  {t('aside.recordSort.desc')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* グループ */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Group />
              <span className="flex-1">{t('aside.groupBy')}</span>
              <span className="text-muted-foreground text-xs">{currentGroupLabel}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuRadioGroup
                value={groupBy ?? 'none'}
                onValueChange={(value) =>
                  onGroupByChange(value === 'none' ? null : (value as RecordPanelGroupByField))
                }
              >
                {groupOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value ?? 'none'}
                    value={option.value ?? 'none'}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 日付フィルター */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar />
              <span className="flex-1">{t('aside.recordDateFilter.label')}</span>
              <span className="text-muted-foreground text-xs">{currentDateFilterLabel}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuRadioGroup
                value={dateFilter}
                onValueChange={(value) => onDateFilterChange(value as RecordPanelDateFilter)}
              >
                {dateFilterOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {/* リセット */}
        {isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReset}>
              <RotateCcw />
              {t('aside.reset')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
