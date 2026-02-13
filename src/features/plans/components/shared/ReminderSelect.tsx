'use client';

import { useState } from 'react';

import { Bell, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

// 通知オプションの定義（UI表示文字列）
export const REMINDER_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '開始時刻', label: 'イベント開始時刻' },
  { value: '10分前', label: '10分前' },
  { value: '30分前', label: '30分前' },
  { value: '1時間前', label: '1時間前' },
  { value: '1日前', label: '1日前' },
  { value: '1週間前', label: '1週間前' },
] as const;

interface ReminderSelectProps {
  value: string; // UI表示文字列（'', '開始時刻', '10分前', ...）
  onChange: (value: string) => void;
  variant?: 'inspector' | 'compact' | 'button' | 'icon'; // inspectorスタイル、compactスタイル、buttonスタイル、またはiconスタイル
  disabled?: boolean; // 無効化フラグ
}

/**
 * 通知選択コンポーネント（ボタン + Popover）
 *
 * Inspector、Card、Tableの全てで共通して使用
 * - inspector: Inspectorで使用する横長スタイル（Bell + テキスト）
 * - compact: Card/Tableで使用するコンパクトスタイル（Bell のみ）
 * - button: Card/Tableポップオーバー内で使用する標準ボタンスタイル（繰り返しと同じ）
 * - icon: アイコンのみのスタイル
 *
 * Radix Popover（Portal経由）を使用し、Inspector内でも正しく表示
 */
export function ReminderSelect({
  value,
  onChange,
  variant = 'inspector',
  disabled = false,
}: ReminderSelectProps) {
  const [showPopover, setShowPopover] = useState(false);

  // 通知が設定されているかどうか
  const hasReminder = value && value !== '';

  // 表示ラベルを取得
  const getDisplayLabel = () => {
    if (!value || value === '') return 'なし';
    const option = REMINDER_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
  };

  const triggerButton = (() => {
    if (variant === 'button') {
      return (
        <button
          type="button"
          disabled={disabled}
          className="border-border bg-secondary text-secondary-foreground hover:bg-state-hover focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-fit items-center gap-1 rounded-lg border px-2 py-0 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{getDisplayLabel()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 opacity-50"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      );
    }

    if (variant === 'inspector') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 text-sm ${hasReminder ? 'text-foreground' : 'text-muted-foreground'}`}
          type="button"
          disabled={disabled}
        >
          {value || '通知'}
        </Button>
      );
    }

    if (variant === 'icon') {
      return (
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
            'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            hasReminder ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={hasReminder ? `通知: ${getDisplayLabel()}` : '通知を設定'}
        >
          <Bell className="size-4" />
          {hasReminder && <span className="text-sm">{getDisplayLabel()}</span>}
        </button>
      );
    }

    // compact variant
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 gap-1 px-2 ${hasReminder ? 'text-foreground' : 'text-muted-foreground'}`}
        type="button"
        disabled={disabled}
      >
        <Bell className="h-4 w-4" />
      </Button>
    );
  })();

  const popoverTrigger = <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>;

  return (
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      {variant === 'icon' ? (
        <HoverTooltip
          content={hasReminder ? `通知: ${getDisplayLabel()}` : '通知を設定'}
          side="top"
        >
          {popoverTrigger}
        </HoverTooltip>
      ) : (
        popoverTrigger
      )}
      <PopoverContent
        className="w-56 p-1"
        align="start"
        sideOffset={4}
        style={{ zIndex: zIndex.overlayDropdown }}
      >
        {REMINDER_OPTIONS.map((option, index) => (
          <div key={option.value}>
            {index === 1 && <div className="border-border my-1 border-t" />}
            <button
              className="hover:bg-state-hover flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm"
              onClick={() => {
                onChange(option.value);
                setShowPopover(false);
              }}
              type="button"
            >
              {option.label}
              {value === option.value && <Check className="text-primary h-4 w-4" />}
            </button>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
