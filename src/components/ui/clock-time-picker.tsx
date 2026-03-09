'use client';

import { memo } from 'react';

import { TimeSelect } from '@/components/common/TimeSelect';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

import type { TimeIconType } from '@/components/common/TimeSelect';

export type { TimeIconType };

export interface ClockTimePickerProps {
  /** 時刻値 "HH:MM" 形式 */
  value: string;
  /** 時刻変更コールバック */
  onChange: (time: string) => void;
  /** 無効状態 */
  disabled?: boolean | undefined;
  /** エラー状態 */
  hasError?: boolean | undefined;
  /** 最小時刻（この時刻以降のみ選択可能） */
  minTime?: string | undefined;
  /** アイコンを表示するか（デフォルト: false） */
  showIcon?: boolean | undefined;
  /** アイコン種別（デフォルト: clock） */
  iconType?: TimeIconType | undefined;
  /** カスタムクラス */
  className?: string | undefined;
  /** ドロップダウン内に duration を表示するか（minTime からの経過時間） */
  showDurationInMenu?: boolean | undefined;
}

/**
 * ClockTimePicker - デバイス適応型時刻ピッカー
 *
 * - PC: TimeSelect（ドロップダウン、キーボード操作に最適化）
 * - モバイル: ネイティブ <input type="time">（OS標準ピッカー）
 */
export const ClockTimePicker = memo<ClockTimePickerProps>(
  ({
    value,
    onChange,
    disabled = false,
    hasError = false,
    minTime,
    showIcon = false,
    iconType = 'clock',
    className,
    showDurationInMenu = false,
  }) => {
    const isMobile = useIsMobile();

    // モバイル: ネイティブ時刻ピッカー（iOS=ホイール, Android=クロック）
    if (isMobile) {
      return (
        <NativeTimePicker
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={hasError}
          className={className}
        />
      );
    }

    // PC: TimeSelect（既存のドロップダウン）
    return (
      <TimeSelect
        value={value}
        onChange={onChange}
        disabled={disabled}
        hasError={hasError}
        showIcon={showIcon}
        iconType={iconType}
        {...(minTime ? { minTime, showDurationInMenu } : {})}
      />
    );
  },
);

ClockTimePicker.displayName = 'ClockTimePicker';

/**
 * モバイル用: ネイティブ時刻ピッカー
 * iOS: ホイールスピナー、Android: クロックダイアル
 */
function NativeTimePicker({
  value,
  onChange,
  disabled,
  hasError,
  className,
}: Pick<ClockTimePickerProps, 'value' | 'onChange' | 'disabled' | 'hasError' | 'className'>) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'text-foreground h-8 rounded-lg bg-transparent px-2 text-sm tabular-nums',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        hasError && 'text-destructive',
        !value && 'text-muted-foreground',
        className,
      )}
    />
  );
}
