'use client';

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/** ソート可能なフィールド */
export type PanelSortField = 'created_at' | 'updated_at' | 'due_date' | 'title';

/** ソート方向 */
export type PanelSortOrder = 'asc' | 'desc';

/** サイドパネル用グルーピングフィールド */
export type PanelGroupByField = 'due_date' | 'tags' | null;

interface PlanListSortMenuProps {
  sortBy: PanelSortField;
  sortOrder: PanelSortOrder;
  groupBy: PanelGroupByField;
  onSortChange: (field: PanelSortField, order: PanelSortOrder) => void;
  onGroupByChange: (field: PanelGroupByField) => void;
}

/**
 * サイドパネル用のソート/グルーピングメニュー
 */
export function PlanListSortMenu({
  sortBy,
  sortOrder,
  groupBy,
  onSortChange,
  onGroupByChange,
}: PlanListSortMenuProps) {
  const t = useTranslations('calendar');

  const sortOptions: Array<{ value: PanelSortField; label: string }> = [
    { value: 'created_at', label: t('panel.sort.createdAt') },
    { value: 'updated_at', label: t('panel.sort.updatedAt') },
    { value: 'due_date', label: t('panel.sort.dueDate') },
    { value: 'title', label: t('panel.sort.title') },
  ];

  const groupOptions: Array<{ value: PanelGroupByField; label: string }> = [
    { value: null, label: t('panel.group.none') },
    { value: 'due_date', label: t('panel.group.dueDate') },
    { value: 'tags', label: t('panel.group.tags') },
  ];

  const isActive = sortBy !== 'created_at' || sortOrder !== 'desc' || groupBy !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6" aria-label={t('panel.sortBy')}>
          <ArrowUpDown className={isActive ? 'text-foreground size-4' : 'size-4'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* ソート */}
        <DropdownMenuLabel className="text-xs">{t('panel.sortBy')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sortBy}
          onValueChange={(value) => onSortChange(value as PanelSortField, sortOrder)}
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {/* ソート方向 */}
        <div className="flex gap-1 px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 flex-1 gap-1 px-2 text-xs',
              sortOrder === 'asc' && 'bg-state-active',
            )}
            onClick={() => onSortChange(sortBy, 'asc')}
          >
            <ArrowUpAZ className="size-3" />
            {t('panel.sort.asc')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 flex-1 gap-1 px-2 text-xs',
              sortOrder === 'desc' && 'bg-state-active',
            )}
            onClick={() => onSortChange(sortBy, 'desc')}
          >
            <ArrowDownAZ className="size-3" />
            {t('panel.sort.desc')}
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* グルーピング */}
        <DropdownMenuLabel className="text-xs">{t('panel.groupBy')}</DropdownMenuLabel>
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
              className="text-xs"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
