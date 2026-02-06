'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlanStatus } from '@/features/plans/types/plan';
import { cn } from '@/lib/utils';

interface PlanListToolbarProps {
  /** 現在のステータスフィルター */
  status: PlanStatus[];
  /** ステータスフィルター変更 */
  onStatusChange: (status: PlanStatus[]) => void;
  /** 検索クエリ */
  search: string;
  /** 検索クエリ変更 */
  onSearchChange: (search: string) => void;
  /** 検索UI展開状態 */
  isSearchOpen: boolean;
  /** 検索UI展開状態変更 */
  onSearchOpenChange: (isOpen: boolean) => void;
}

/**
 * サイドパネル用のPlanリストツールバー
 *
 * - Open/Closed切替
 * - 検索バー（アイコンクリックで展開）
 */
export function PlanListToolbar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  isSearchOpen,
  onSearchOpenChange,
}: PlanListToolbarProps) {
  const t = useTranslations('calendar');

  // 現在のフィルター状態を判定
  const isOpenActive = status.length === 1 && status[0] === 'open';
  const isClosedActive = status.length === 1 && status[0] === 'closed';
  const isAllActive = status.length === 2;

  return (
    <div className="border-border flex h-10 items-center gap-1 border-b px-2">
      {isSearchOpen ? (
        // 検索モード
        <div className="flex flex-1 items-center gap-2">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <Input
            type="text"
            placeholder={t('panel.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 flex-1 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              onSearchChange('');
              onSearchOpenChange(false);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        // 通常モード
        <>
          {/* ステータス切替 */}
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-6 px-2 text-xs', isOpenActive && 'bg-state-active')}
              onClick={() => onStatusChange(['open'])}
            >
              {t('panel.open')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-6 px-2 text-xs', isClosedActive && 'bg-state-active')}
              onClick={() => onStatusChange(['closed'])}
            >
              {t('panel.closed')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-6 px-2 text-xs', isAllActive && 'bg-state-active')}
              onClick={() => onStatusChange(['open', 'closed'])}
            >
              {t('panel.all')}
            </Button>
          </div>

          {/* スペーサー */}
          <div className="flex-1" />

          {/* 検索ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onSearchOpenChange(true)}
          >
            <Search className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
