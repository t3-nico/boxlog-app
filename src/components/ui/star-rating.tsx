'use client';

import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** 現在の値（1-5、nullは未選択） */
  value: number | null;
  /** 値変更時のコールバック */
  onChange: (value: number | null) => void;
  /** 最大値（デフォルト: 5） */
  max?: number;
  /** サイズ */
  size?: 'sm' | 'md';
  /** 無効状態 */
  disabled?: boolean;
  /** 読み取り専用 */
  readOnly?: boolean;
}

/**
 * 星評価コンポーネント
 *
 * クリックで星を選択（1-max）
 * 同じ値を再クリックで null にリセット
 * ホバーでプレビュー表示
 *
 * @example
 * ```tsx
 * <StarRating value={score} onChange={setScore} />
 * ```
 */
export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = useCallback(
    (starValue: number) => {
      if (disabled || readOnly) return;

      // 同じ値をクリックしたらリセット
      if (value === starValue) {
        onChange(null);
      } else {
        onChange(starValue);
      }
    },
    [value, onChange, disabled, readOnly],
  );

  const handleMouseEnter = useCallback(
    (starValue: number) => {
      if (disabled || readOnly) return;
      setHoverValue(starValue);
    },
    [disabled, readOnly],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
  };

  const displayValue = hoverValue ?? value ?? 0;

  return (
    <div
      className={cn('flex items-center gap-0.5', disabled && 'opacity-50')}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            disabled={disabled}
            className={cn(
              'focus-visible:ring-ring rounded-sm p-0.5 transition-colors focus-visible:ring-1 focus-visible:outline-none',
              !disabled && !readOnly && 'cursor-pointer hover:scale-110',
              (disabled || readOnly) && 'cursor-default',
            )}
            aria-label={`${starValue}点`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
