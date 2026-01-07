'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type OpenFilter = 'all' | 'today' | 'overdue';
export type OpenSort = 'due' | 'created' | 'updated';

interface OpenNavigationProps {
  filter: OpenFilter;
  onFilterChange: (filter: OpenFilter) => void;
  sort: OpenSort;
  onSortChange: (sort: OpenSort) => void;
}

/**
 * OpenNavigation - Openタブのフィルター・ソート設定
 *
 * **構成**:
 * - 期間フィルター: ドロップダウンボタン（All / Today / Overdue）
 * - ソート順: ドロップダウンボタン（Due / Created / Updated）
 */
export function OpenNavigation({
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: OpenNavigationProps) {
  const t = useTranslations('calendar.open.navigation');

  // フィルターラベルのマッピング
  const filterLabels: Record<OpenFilter, string> = {
    all: t('all'),
    today: t('today'),
    overdue: t('overdue'),
  };

  // ソートラベルのマッピング
  const sortLabels: Record<OpenSort, string> = {
    due: t('dueDate'),
    created: t('created'),
    updated: t('updated'),
  };

  return (
    <div className="flex items-center gap-2">
      {/* 期間フィルター */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
            <span>{filterLabels[filter]}</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup
            value={filter}
            onValueChange={(value) => onFilterChange(value as OpenFilter)}
          >
            <DropdownMenuRadioItem value="all">{t('all')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="today">{t('today')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="overdue">{t('overdue')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ソート順 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
            <span>{sortLabels[sort]}</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => onSortChange(value as OpenSort)}
          >
            <DropdownMenuRadioItem value="due">{t('dueDate')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">{t('created')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="updated">{t('updated')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
