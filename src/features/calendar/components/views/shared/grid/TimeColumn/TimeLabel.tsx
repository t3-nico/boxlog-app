/**
 * 個別の時間ラベルコンポーネント
 */

'use client';

import { memo } from 'react';

interface TimeLabelProps {
  hour: number;
  label: string;
  position: number;
  hourHeight: number;
  isFirst: boolean;
  isLast: boolean;
  /** 折りたたみセクションの境界かどうか */
  isCollapsedBoundary?: boolean | undefined;
}

export const TimeLabel = memo<TimeLabelProps>(function TimeLabel({
  hour,
  label,
  position,
  isFirst,
  isCollapsedBoundary,
}) {
  return (
    <div
      className="text-muted-foreground absolute w-full text-xs select-none"
      style={{
        top: `${position}px`,
        height: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '4px',
        paddingRight: '4px',
      }}
    >
      {/* 0時は表示しない（見た目がすっきりする） - ただし折りたたみ境界では表示 */}
      {(!(hour === 0 && isFirst) || isCollapsedBoundary) && (
        <span className="bg-background">{label}</span>
      )}
    </div>
  );
});
