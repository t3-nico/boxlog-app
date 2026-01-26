'use client';

import { Repeat } from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

import { configToReadable, ruleToConfig } from '../../utils/rrule';

export type RecurringIndicatorSize = 'xs' | 'sm' | 'md';

export interface RecurringIndicatorProps {
  /**
   * 繰り返しタイプ（シンプル版）
   * 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'none'
   */
  recurrenceType?: string | null;
  /**
   * 繰り返しルール（RRULE形式）
   * カスタム繰り返し設定時に使用
   */
  recurrenceRule?: string | null;
  /**
   * アイコンサイズ
   * - xs: h-3 w-3 (カード内)
   * - sm: h-3.5 w-3.5 (アジェンダ/テーブル)
   * - md: h-4 w-4 (デフォルト)
   */
  size?: RecurringIndicatorSize;
  /**
   * ツールチップを表示するか
   */
  showTooltip?: boolean;
  /**
   * 追加のクラス名
   */
  className?: string;
}

const sizeClasses: Record<RecurringIndicatorSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

/**
 * 繰り返しプランの表示を統一するための共通コンポーネント
 *
 * 使用箇所:
 * - Calendar PlanCard
 * - Kanban PlanCard
 * - Agenda Item
 * - Plan DateTimeCell
 *
 * @example
 * ```tsx
 * // シンプル表示（アイコンのみ）
 * <RecurringIndicator recurrenceType="weekly" size="xs" />
 *
 * // ツールチップ付き
 * <RecurringIndicator
 *   recurrenceType="weekly"
 *   recurrenceRule="FREQ=WEEKLY;BYDAY=MO,WE,FR"
 *   showTooltip
 * />
 * ```
 */
export function RecurringIndicator({
  recurrenceType,
  recurrenceRule,
  size = 'md',
  showTooltip = false,
  className,
}: RecurringIndicatorProps) {
  const locale = useLocale();

  // 繰り返し設定がない場合は何も表示しない
  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none');
  if (!hasRecurrence) {
    return null;
  }

  // ツールチップ用のテキストを生成
  const getTooltipText = (): string => {
    // カスタムルール（RRULE）がある場合
    if (recurrenceRule) {
      return configToReadable(ruleToConfig(recurrenceRule));
    }

    // シンプルな繰り返しタイプ
    if (recurrenceType && recurrenceType !== 'none') {
      const typeMap: Record<string, { ja: string; en: string }> = {
        daily: { ja: '毎日', en: 'Daily' },
        weekly: { ja: '毎週', en: 'Weekly' },
        monthly: { ja: '毎月', en: 'Monthly' },
        yearly: { ja: '毎年', en: 'Yearly' },
        weekdays: { ja: '平日', en: 'Weekdays' },
      };
      const labels = typeMap[recurrenceType];
      return labels ? (locale === 'ja' ? labels.ja : labels.en) : '';
    }

    return locale === 'ja' ? '繰り返し' : 'Recurring';
  };

  const icon = (
    <Repeat
      className={cn('text-muted-foreground flex-shrink-0', sizeClasses[size], className)}
      aria-label={locale === 'ja' ? '繰り返し' : 'Recurring'}
    />
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <HoverTooltip content={getTooltipText()} side="top">
      <span className="inline-flex">{icon}</span>
    </HoverTooltip>
  );
}

/**
 * isRecurring フラグから表示するかどうかを判定するヘルパー
 * CalendarPlan型で使用
 */
export function RecurringIndicatorFromFlag({
  isRecurring,
  size = 'md',
  className,
}: {
  isRecurring?: boolean;
  size?: RecurringIndicatorSize;
  className?: string;
}) {
  const locale = useLocale();

  if (!isRecurring) {
    return null;
  }

  return (
    <Repeat
      className={cn('text-muted-foreground flex-shrink-0', sizeClasses[size], className)}
      aria-label={locale === 'ja' ? '繰り返し' : 'Recurring'}
    />
  );
}
