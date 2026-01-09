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

export type OpenSort = 'created' | 'updated';

interface OpenNavigationProps {
  sort: OpenSort;
  onSortChange: (sort: OpenSort) => void;
}

/**
 * OpenNavigation - Openタブのソート設定
 *
 * **構成**:
 * - ソート順: ドロップダウンボタン（Created / Updated）
 *
 * **Note**: 未スケジュールのプランはdue_dateがないケースが多いため、
 * 期間フィルター（today/overdue）は削除
 */
export function OpenNavigation({ sort, onSortChange }: OpenNavigationProps) {
  const t = useTranslations('calendar.open.navigation');

  // ソートラベルのマッピング
  const sortLabels: Record<OpenSort, string> = {
    created: t('created'),
    updated: t('updated'),
  };

  return (
    <div className="flex items-center gap-2">
      {/* ソート順 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <span>{sortLabels[sort]}</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(value) => onSortChange(value as OpenSort)}
          >
            <DropdownMenuRadioItem value="created">{t('created')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="updated">{t('updated')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
