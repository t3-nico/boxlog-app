'use client';

/**
 * タイトル入力コンポーネント
 *
 * Plan/Record Inspector共通で使用する大きなタイトル入力フィールド
 */

import { forwardRef, useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/** タイトルの最大文字数（スキーマ定義と同期） */
const TITLE_MAX_LENGTH = 200;

interface TitleInputProps {
  /** 現在の値 */
  value: string;
  /** 値変更時のコールバック */
  onChange: (value: string) => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 追加のクラス名 */
  className?: string;
  /** アクセシビリティラベル */
  'aria-label'?: string;
  /** 自動フォーカス（Inspector開いた時など） */
  autoFocus?: boolean;
  /** 自動フォーカス時に全選択するか */
  selectOnFocus?: boolean;
  /** 最大文字数（デフォルト: 200） */
  maxLength?: number;
}

/**
 * TitleInput
 *
 * Inspector内で使用する大きなタイトル入力フィールド。
 * - 外部から渡されたvalueと内部のlocalStateを同期
 * - 自動フォーカス＆全選択をサポート
 */
export const TitleInput = forwardRef<HTMLInputElement, TitleInputProps>(function TitleInput(
  {
    value,
    onChange,
    placeholder = '',
    className,
    'aria-label': ariaLabel,
    autoFocus = false,
    selectOnFocus = false,
    maxLength = TITLE_MAX_LENGTH,
  },
  ref,
) {
  // ローカル状態（controlled component用）
  const [localValue, setLocalValue] = useState(value);

  // 外部のvalueが変わったらローカル状態を同期（別アイテムを開いた時など）
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  // 自動フォーカス処理
  useEffect(() => {
    if (autoFocus && ref && typeof ref !== 'function' && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.focus();
        if (selectOnFocus) {
          ref.current?.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus, selectOnFocus, ref]);

  return (
    <input
      ref={ref}
      type="text"
      value={localValue}
      placeholder={placeholder}
      onChange={handleChange}
      maxLength={maxLength}
      className={cn(
        'placeholder:text-muted-foreground block w-full border-0 bg-transparent text-xl font-bold outline-none',
        className,
      )}
      aria-label={ariaLabel}
    />
  );
});
