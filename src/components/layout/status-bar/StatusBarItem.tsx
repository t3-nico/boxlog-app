'use client';

import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface StatusBarItemProps {
  /** 表示するアイコン（lucide-react等） */
  icon?: React.ReactNode;
  /** 表示するテキスト */
  label: string;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** ツールチップテキスト */
  tooltip?: string;
  /** 追加のクラス名 */
  className?: string;
  /** 無効状態 */
  disabled?: boolean;
  /** 強制的にクリック可能なスタイルを適用（Popoverのトリガーなど外部でクリックを処理する場合） */
  forceClickable?: boolean;
}

/**
 * ステータスバーアイテム - 個々の表示要素
 *
 * @description
 * - モノトーン基調（text-muted-foreground）
 * - ホバー時に明るく（hover:text-foreground）
 * - クリック可能な場合はカーソルがポインターに
 *
 * @example
 * ```tsx
 * <StatusBarItem
 *   icon={<Calendar className="h-3.5 w-3.5" />}
 *   label="ミーティング (14:00-15:00)"
 *   onClick={() => router.push('/calendar')}
 *   tooltip="カレンダーを開く"
 * />
 * ```
 */
export function StatusBarItem({
  icon,
  label,
  onClick,
  tooltip,
  className,
  disabled = false,
  forceClickable = false,
}: StatusBarItemProps) {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
        e.preventDefault();
        onClick();
      }
    },
    [disabled, onClick],
  );

  const isClickable = (!!onClick || forceClickable) && !disabled;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={tooltip}
      title={tooltip}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // ベーススタイル
        'flex items-center gap-1.5',
        // フォントサイズ（12px）・アイコンサイズ（12px）
        'text-xs [&_svg]:size-3',
        // パディング・角丸（ホバー背景用）
        'rounded-sm px-1.5 py-0.5',
        // テキストカラー
        'text-muted-foreground',
        // トランジション
        'transition-colors duration-150',
        // インタラクティブな場合
        isClickable && [
          'cursor-pointer',
          'hover:text-foreground hover:bg-state-hover',
          'active:bg-state-hover',
          'focus-visible:text-foreground focus-visible:bg-state-hover focus-visible:outline-none',
        ],
        // 無効状態
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}
