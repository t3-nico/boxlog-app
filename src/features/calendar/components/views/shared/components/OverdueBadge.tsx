'use client';

import { AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { OverduePlan } from '../../../../hooks/useOverduePlans';

interface OverdueBadgeProps {
  /** 期限切れプラン一覧 */
  overduePlans: OverduePlan[];
  /** 追加のクラス名 */
  className?: string;
}

/**
 * OverdueBadge - 期限切れプランの件数を表示するバッジ
 *
 * @description
 * カレンダーの上部に表示され、期限切れの未完了プランの件数を表示する。
 * クリックで詳細ポップオーバーを表示予定。
 */
export function OverdueBadge({ overduePlans, className }: OverdueBadgeProps) {
  if (overduePlans.length === 0) return null;

  return (
    <button
      type="button"
      className={cn(
        'text-warning-foreground flex items-center gap-1 text-xs font-medium',
        className,
      )}
    >
      <AlertTriangle className="size-3" aria-hidden="true" />
      <span>{overduePlans.length}</span>
    </button>
  );
}
