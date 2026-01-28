'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Clock } from 'lucide-react';
import { TimepickerUI } from 'timepicker-ui';

import { TimeSelect } from '@/features/plans/components/shared/TimeSelect';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

import 'timepicker-ui/index.css';

export interface ClockTimePickerProps {
  /** 時刻値 "HH:MM" 形式 */
  value: string;
  /** 時刻変更コールバック */
  onChange: (time: string) => void;
  /** プレースホルダー */
  placeholder?: string | undefined;
  /** 無効状態 */
  disabled?: boolean | undefined;
  /** エラー状態 */
  hasError?: boolean | undefined;
  /** 最小時刻（この時刻以降のみ選択可能） */
  minTime?: string | undefined;
  /** アイコンを表示するか（デフォルト: false） */
  showIcon?: boolean | undefined;
  /** カスタムクラス */
  className?: string | undefined;
}

/**
 * ClockTimePicker - デバイス適応型時刻ピッカー
 *
 * - PC: TimeSelect（ドロップダウン、キーボード操作に最適化）
 * - モバイル: Material Design風クロックピッカー（タッチ操作に最適化）
 */
export const ClockTimePicker = memo<ClockTimePickerProps>(
  ({
    value,
    onChange,
    placeholder = '--:--',
    disabled = false,
    hasError = false,
    minTime,
    showIcon = false,
    className,
  }) => {
    const isMobile = useIsMobile();

    // モバイル: クロックピッカー
    if (isMobile) {
      return (
        <MobileClockPicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          hasError={hasError}
          showIcon={showIcon}
          className={className}
        />
      );
    }

    // PC: TimeSelect（既存のドロップダウン）
    return (
      <TimeSelect
        value={value}
        onChange={onChange}
        label=""
        disabled={disabled}
        hasError={hasError}
        showIcon={showIcon}
        {...(minTime ? { minTime } : {})}
      />
    );
  },
);

ClockTimePicker.displayName = 'ClockTimePicker';

/**
 * モバイル用: Material Design クロックピッカー
 * タッチ操作に最適化
 */
function MobileClockPicker({
  value,
  onChange,
  placeholder = '--:--',
  disabled,
  hasError,
  showIcon,
  className,
}: ClockTimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timepickerRef = useRef<TimepickerUI | null>(null);
  const isInitializedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // timepicker 初期化
  useEffect(() => {
    if (!isMounted || !inputRef.current || isInitializedRef.current) return;

    const tp = new TimepickerUI(inputRef.current, {
      clock: {
        type: '24h',
        incrementMinutes: 5,
        autoSwitchToMinutes: true,
      },
      ui: {
        theme: 'basic',
        animation: true,
        backdrop: true,
        mobile: false, // 円形クロックを使用
        enableSwitchIcon: false,
        editable: false,
      },
      labels: {
        ok: 'OK',
        cancel: 'Cancel',
        time: 'Select time',
      },
      behavior: {
        focusInputAfterClose: false,
      },
    });

    tp.create();
    timepickerRef.current = tp;
    isInitializedRef.current = true;

    // イベントリスナー登録
    tp.on('confirm', (data) => {
      if (data.hour && data.minutes) {
        const hour = data.hour.padStart(2, '0');
        const minutes = data.minutes.padStart(2, '0');
        onChange(`${hour}:${minutes}`);
      }
    });

    return () => {
      if (timepickerRef.current) {
        timepickerRef.current.destroy();
        timepickerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [isMounted, onChange]);

  // value が変更されたら timepicker に反映
  useEffect(() => {
    if (timepickerRef.current && value) {
      timepickerRef.current.setValue(value, true);
    }
  }, [value]);

  // ボタンクリックで timepicker を開く
  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    timepickerRef.current?.open();
  }, [disabled]);

  // 表示用の時刻フォーマット
  const displayValue = value || placeholder;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative">
      {/* 隠し入力（timepicker-ui が使用） */}
      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        defaultValue={value}
        readOnly
        disabled={disabled}
      />

      {/* 表示用ボタン */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleButtonClick}
        className={cn(
          'text-muted-foreground data-[state=selected]:text-foreground',
          'hover:bg-state-hover inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm transition-colors',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          hasError && 'text-destructive',
          className,
        )}
        data-state={value ? 'selected' : undefined}
        aria-label={`時刻選択: ${value || '未選択'}`}
      >
        {showIcon && <Clock className="size-4" />}
        <span>{displayValue}</span>
      </button>
    </div>
  );
}
