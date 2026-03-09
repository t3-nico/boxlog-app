import { cn } from '@/lib/utils';

interface TimeProgressBarProps {
  /** 予定時間（分） */
  plannedMinutes: number;
  /** 実績時間（分） */
  actualMinutes: number;
}

/**
 * 予定に対する実績の達成度バー
 *
 * - <100%: bg-destructive（マイナス — 早く終了）
 * - =100%: bg-success（ぴったり）
 * - >100%: bg-warning（超過）
 * - plannedMinutes === 0: 非表示
 */
export function TimeProgressBar({ plannedMinutes, actualMinutes }: TimeProgressBarProps) {
  if (plannedMinutes <= 0) return null;

  const percentage = (actualMinutes / plannedMinutes) * 100;
  const barColor =
    percentage > 100 ? 'bg-warning' : percentage === 100 ? 'bg-success' : 'bg-destructive';

  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className={cn('h-full rounded-full transition-all', barColor)}
        style={{ width: `${Math.min(percentage, 100)}%` }}
        role="progressbar"
        aria-valuenow={actualMinutes}
        aria-valuemax={plannedMinutes}
      />
    </div>
  );
}
