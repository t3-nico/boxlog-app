/**
 * 時間列コンポーネント（左側の時間表示）
 * Googleカレンダー風のフレックス構造
 */

'use client';

import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { TIME_COLUMN_WIDTH } from '../../constants/grid.constants';

import type { TimeColumnProps } from '../../types/grid.types';

/**
 * 時間ラベルをフォーマット
 */
function formatHourLabel(hour: number, format: '12h' | '24h'): string {
  if (format === '24h') {
    return `${String(hour).padStart(2, '0')}:00`;
  }
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h}:00 ${ampm}`;
}

export const TimeColumn = memo<TimeColumnProps>(function TimeColumn({
  startHour = 0,
  endHour = 24,
  hourHeight = 72,
  format = '24h',
  className = '',
}) {
  // グリッド高さ
  const gridHeight = (endHour - startHour) * hourHeight;

  // 時間行を生成
  const timeRows = useMemo(() => {
    const rows: React.ReactNode[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const label = formatHourLabel(hour, format);
      // 0時はラベルを表示しない（見た目がすっきりする）
      const showLabel = hour !== 0;

      rows.push(
        <div
          key={`hour-${hour}`}
          className="text-muted-foreground relative flex items-start pr-2 pl-4 text-xs select-none"
          style={{ height: `${hourHeight}px` }}
        >
          {showLabel && <span className="bg-background -translate-y-1/2">{label}</span>}
        </div>,
      );
    }

    return rows;
  }, [startHour, endHour, hourHeight, format]);

  return (
    <div
      className={cn(
        'bg-background border-border sticky left-0 z-10 flex flex-col border-r',
        className,
      )}
      style={{
        width: `${TIME_COLUMN_WIDTH}px`,
        height: `${gridHeight}px`,
      }}
    >
      {timeRows}
    </div>
  );
});
