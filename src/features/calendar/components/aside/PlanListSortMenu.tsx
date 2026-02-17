'use client';

import { ArrowUpDown, Calendar, CircleDot, Group, RotateCcw, Settings2 } from 'lucide-react';
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

/** ソート可能なフィールド */
export type PanelSortField = 'created_at' | 'updated_at' | 'title';

/** ソート方向 */
export type PanelSortOrder = 'asc' | 'desc';

/** アサイド用グルーピングフィールド */
export type PanelGroupByField = 'tags' | null;

/** スケジュールフィルター */
export type PanelScheduleFilter = 'all' | 'scheduled' | 'unscheduled';

/** ステータスフィルター */
export type PanelStatusFilter = 'all' | 'open' | 'closed';

interface PlanListSortMenuProps {
  sortBy: PanelSortField;
  sortOrder: PanelSortOrder;
  groupBy: PanelGroupByField;
  scheduleFilter: PanelScheduleFilter;
  statusFilter: PanelStatusFilter;
  onSortChange: (field: PanelSortField, order: PanelSortOrder) => void;
  onGroupByChange: (field: PanelGroupByField) => void;
  onScheduleFilterChange: (filter: PanelScheduleFilter) => void;
  onStatusFilterChange: (filter: PanelStatusFilter) => void;
}

/**
 * アサイド用のソート/グルーピングメニュー
 *
 * Notion風サブメニューパターン:
 * - 各カテゴリ行に現在の値を表示
 * - クリックでサブメニュー展開
 */
export function PlanListSortMenu({
  sortBy,
  sortOrder,
  groupBy,
  scheduleFilter,
  statusFilter,
  onSortChange,
  onGroupByChange,
  onScheduleFilterChange,
  onStatusFilterChange,
}: PlanListSortMenuProps) {
  const t = useTranslations('calendar');

  const sortOptions: Array<{ value: PanelSortField; label: string }> = [
    { value: 'created_at', label: t('aside.sort.createdAt') },
    { value: 'updated_at', label: t('aside.sort.updatedAt') },
    { value: 'title', label: t('aside.sort.title') },
  ];

  const groupOptions: Array<{ value: PanelGroupByField; label: string }> = [
    { value: null, label: t('aside.group.none') },
    { value: 'tags', label: t('aside.group.tags') },
  ];

  const scheduleOptions: Array<{ value: PanelScheduleFilter; label: string }> = [
    { value: 'all', label: t('aside.schedule.all') },
    { value: 'scheduled', label: t('aside.schedule.scheduled') },
    { value: 'unscheduled', label: t('aside.schedule.unscheduled') },
  ];

  const statusOptions: Array<{ value: PanelStatusFilter; label: string }> = [
    { value: 'all', label: t('aside.status.all') },
    { value: 'open', label: t('aside.status.open') },
    { value: 'closed', label: t('aside.status.closed') },
  ];

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? '';
  const currentGroupLabel = groupOptions.find((o) => o.value === groupBy)?.label ?? '';
  const currentScheduleLabel = scheduleOptions.find((o) => o.value === scheduleFilter)?.label ?? '';
  const currentStatusLabel = statusOptions.find((o) => o.value === statusFilter)?.label ?? '';

  const isActive =
    sortBy !== 'created_at' ||
    sortOrder !== 'desc' ||
    groupBy !== null ||
    scheduleFilter !== 'unscheduled' ||
    statusFilter !== 'open';

  const handleReset = () => {
    onSortChange('created_at', 'desc');
    onGroupByChange(null);
    onScheduleFilterChange('unscheduled');
    onStatusFilterChange('open');
  };

  return (
    <DropdownMenu>
      <HoverTooltip content={t('aside.sortBy')} side="top">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" icon className="size-6" aria-label={t('aside.sortBy')}>
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
                onValueChange={(value) => onSortChange(value as PanelSortField, sortOrder)}
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
                onValueChange={(value) => onSortChange(sortBy, value as PanelSortOrder)}
              >
                <DropdownMenuRadioItem value="asc">{t('aside.sort.asc')}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">{t('aside.sort.desc')}</DropdownMenuRadioItem>
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
                  onGroupByChange(value === 'none' ? null : (value as PanelGroupByField))
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

          {/* ステータス */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleDot />
              <span className="flex-1">{t('aside.status.label')}</span>
              <span className="text-muted-foreground text-xs">{currentStatusLabel}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) => onStatusFilterChange(value as PanelStatusFilter)}
              >
                {statusOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 日付 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar />
              <span className="flex-1">{t('aside.schedule.label')}</span>
              <span className="text-muted-foreground text-xs">{currentScheduleLabel}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuRadioGroup
                value={scheduleFilter}
                onValueChange={(value) => onScheduleFilterChange(value as PanelScheduleFilter)}
              >
                {scheduleOptions.map((option) => (
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
