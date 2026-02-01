'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Repeat } from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { RecurrenceDialog } from './RecurrenceDialog';

// 繰り返しオプション
const RECURRENCE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '毎日', label: '毎日' },
  { value: '毎週', label: '毎週' },
  { value: '毎月', label: '毎月' },
  { value: '毎年', label: '毎年' },
  { value: '平日', label: '平日（月〜金）' },
] as const;

interface RecurrenceIconButtonProps {
  recurrenceRule: string | null;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rule: string | null) => void;
  disabled?: boolean;
}

/**
 * 繰り返し設定アイコンボタン
 * ReminderSelectと同じパターンで、アイコン + テキスト表示
 */
export function RecurrenceIconButton({
  recurrenceRule,
  recurrenceType,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  disabled = false,
}: RecurrenceIconButtonProps) {
  const recurrenceRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recurrenceRef.current && !recurrenceRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 繰り返しが設定されているかどうか
  const hasRecurrence = recurrenceRule || (recurrenceType && recurrenceType !== 'none');

  // 表示テキスト
  const displayText = (() => {
    if (recurrenceRule) {
      // RRULEがある場合は簡易表示（詳細はtooltipで）
      return 'カスタム';
    }
    if (recurrenceType && recurrenceType !== 'none') {
      const typeMap: Record<string, string> = {
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月',
        yearly: '毎年',
        weekdays: '平日',
      };
      return typeMap[recurrenceType] || '繰り返し';
    }
    return null;
  })();

  return (
    <div className="relative" ref={recurrenceRef}>
      <HoverTooltip
        content={hasRecurrence ? `繰り返し: ${displayText}` : '繰り返しを設定'}
        side="top"
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setShowPopover(!showPopover);
            }
          }}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 transition-colors',
            'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            hasRecurrence ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={hasRecurrence ? `繰り返し: ${displayText}` : '繰り返しを設定'}
          aria-expanded={showPopover}
          aria-haspopup="menu"
        >
          <Repeat className="size-4" />
          {hasRecurrence && <span className="text-sm">{displayText}</span>}
        </button>
      </HoverTooltip>

      {/* ポップオーバー */}
      {showPopover && !disabled && (
        <div
          className="border-border bg-popover absolute top-10 left-0 z-50 w-48 rounded-md border shadow-md"
          role="menu"
          aria-label="繰り返しオプション"
        >
          <div className="p-1">
            <button
              className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
              onClick={() => {
                onRepeatTypeChange('');
                onRecurrenceRuleChange(null);
                setShowPopover(false);
              }}
              type="button"
              role="menuitem"
            >
              選択しない
              {!hasRecurrence && <Check className="text-primary h-4 w-4" />}
            </button>
            <div className="border-border my-1 border-t" />
            {RECURRENCE_OPTIONS.slice(1).map((option) => (
              <button
                key={option.value}
                className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
                onClick={() => {
                  onRepeatTypeChange(option.value);
                  onRecurrenceRuleChange(null);
                  setShowPopover(false);
                }}
                type="button"
                role="menuitem"
              >
                {option.label}
                {displayText === option.value && <Check className="text-primary h-4 w-4" />}
              </button>
            ))}
            <div className="border-border my-1 border-t" />
            <button
              className="hover:bg-state-hover focus-visible:bg-state-hover flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none"
              onClick={() => {
                setShowPopover(false);
                setShowCustomDialog(true);
              }}
              type="button"
              role="menuitem"
            >
              カスタム...
            </button>
          </div>
        </div>
      )}

      {/* カスタム繰り返しDialog */}
      <RecurrenceDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        value={recurrenceRule}
        onChange={onRecurrenceRuleChange}
      />
    </div>
  );
}
