/**
 * 日付ヘッダーコンポーネント
 */

'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';

import type { DayDisplayProps } from '../types/view.types';
import { formatDate } from '../utils/dateHelpers';

// ヘルパー関数: ヘッダークラスを生成
const generateHeaderClasses = (
  isToday: boolean,
  isSelected: boolean,
  isWeekend: boolean,
  onClick?: (date: Date) => void,
  className?: string,
): string => {
  const baseClasses =
    'flex items-center justify-center py-2 px-1 text-center transition-colors rounded-xl';

  const hoverClasses =
    onClick && !isToday
      ? 'cursor-pointer hover:bg-state-hover'
      : onClick && isToday
        ? 'cursor-pointer'
        : '';

  const statusClasses = isToday
    ? 'bg-primary text-primary-foreground font-semibold'
    : isSelected
      ? 'bg-primary/10 text-primary'
      : isWeekend
        ? 'text-muted-foreground'
        : 'text-foreground';

  return [baseClasses, hoverClasses, statusClasses, className].filter(Boolean).join(' ');
};

// ヘルパー関数: テキストクラスを生成
const getTextClasses = (isToday: boolean, isBase: boolean = false): string => {
  if (isToday) {
    return isBase ? 'text-primary-foreground' : 'text-primary-foreground/75';
  }
  return 'text-muted-foreground';
};

export const DayDisplay = memo<DayDisplayProps>(function DayDisplay({
  date,
  isToday = false,
  isWeekend = false,
  isSelected = false,
  format = 'short',
  onClick,
  className = '',
}) {
  const handleClick = () => {
    onClick?.(date);
  };

  // ヘッダーのスタイルクラス
  const headerClasses = generateHeaderClasses(isToday, isSelected, isWeekend, onClick, className);

  // 日付の表示形式
  const dateDisplay = formatDate(date, format);

  return onClick ? (
    <button
      className={headerClasses}
      onClick={handleClick}
      aria-label={`${dateDisplay}を選択`}
      type="button"
    >
      <div className="flex min-w-0 flex-col items-center">
        {/* 曜日 */}
        <div className={cn('text-xs', getTextClasses(isToday))}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>

        {/* 日付 */}
        <div className={cn('text-lg font-semibold', getTextClasses(isToday, true))}>
          {date.getDate()}
        </div>

        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={cn('text-xs', getTextClasses(isToday))}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </button>
  ) : (
    <div className={headerClasses}>
      <div className="flex min-w-0 flex-col items-center">
        {/* 曜日 */}
        <div className={`text-xs ${getTextClasses(isToday)}`}>
          {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
        </div>

        {/* 日付 */}
        <div className={`text-lg font-semibold ${getTextClasses(isToday, true)}`}>
          {date.getDate()}
        </div>

        {/* 月（異なる月の場合のみ表示） */}
        {format === 'long' && (
          <div className={`text-xs ${getTextClasses(isToday)}`}>
            {date.toLocaleDateString('ja-JP', { month: 'short' })}
          </div>
        )}
      </div>
    </div>
  );
});
