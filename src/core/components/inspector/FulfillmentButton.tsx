'use client';

/**
 * 充実度ボタン（共通コンポーネント）
 *
 * Plan/Record共通で使用する充実度スコア入力ボタン
 * - タップ: スコア加算（1→2→3→4→5）
 * - 長押し（500ms）: リセット（null）
 */

import { Smile } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { FulfillmentScore } from '@/core/types/record';

interface FulfillmentButtonProps {
  /** 現在のスコア（null = 未設定） */
  score: FulfillmentScore | null;
  /** スコア変更時のコールバック */
  onScoreChange: (value: FulfillmentScore | null) => void;
  /** 無効化フラグ */
  disabled?: boolean;
}

export function FulfillmentButton({
  score,
  onScoreChange,
  disabled = false,
}: FulfillmentButtonProps) {
  const t = useTranslations();
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const isPressingRef = useRef(false);

  const hasScore = score !== null;

  // 長押し開始
  const handlePressStart = useCallback(() => {
    if (disabled) return;
    isPressingRef.current = true;
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onScoreChange(null);
    }, 500);
  }, [onScoreChange, disabled]);

  // 長押し終了 / タップ
  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    if (!isLongPressRef.current) {
      const newScore = Math.min((score ?? 0) + 1, 5) as FulfillmentScore;
      onScoreChange(newScore);
    }
  }, [score, onScoreChange]);

  // タイマークリーンアップ
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  return (
    <HoverTooltip
      content={
        hasScore
          ? t('plan.inspector.recordCreate.fulfillmentTooltip', { score: score ?? 0 })
          : t('plan.inspector.recordCreate.fulfillmentTap')
      }
      side="top"
    >
      <button
        type="button"
        disabled={disabled}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={cn(
          'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
          'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          'select-none',
          hasScore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label={t('plan.inspector.recordCreate.fulfillmentLabel', { score: score ?? 0 })}
      >
        <Smile className="size-4" />
        {hasScore && <span className="text-xs font-bold tabular-nums">{score}</span>}
      </button>
    </HoverTooltip>
  );
}
