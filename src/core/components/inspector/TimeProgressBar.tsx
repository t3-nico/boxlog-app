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
 * - ≤100%: bg-success（予定内）
 * - >100%: bg-warning（予定超過）
 * - plannedMinutes === 0: 非表示
 */
export function TimeProgressBar({ plannedMinutes, actualMinutes }: TimeProgressBarProps) {
  if (plannedMinutes <= 0) return null;

  const percentage = (actualMinutes / plannedMinutes) * 100;

  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className={cn(
          'h-full rounded-full transition-all',
          percentage <= 100 ? 'bg-success' : 'bg-warning',
        )}
        style={{ width: `${Math.min(percentage, 100)}%` }}
        role="progressbar"
        aria-valuenow={actualMinutes}
        aria-valuemax={plannedMinutes}
      />
    </div>
  );
}
