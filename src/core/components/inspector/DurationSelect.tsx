'use client';

/**
 * Duration 選択ドロップダウン
 *
 * ghostボタンで現在のdurationを表示し、クリックで15分刻みの選択肢を表示。
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { formatDurationDisplay } from '@/lib/time-utils';
import { cn } from '@/lib/utils';

/** 15分刻みの duration オプションを生成（15m 〜 8h） */
function generateDurationOptions(): number[] {
  const options: number[] = [];
  for (let m = 15; m <= 480; m += 15) {
    options.push(m);
  }
  return options;
}

const DURATION_OPTIONS = generateDurationOptions();

interface DurationSelectProps {
  /** 現在の duration（分） */
  value: number;
  /** duration 変更時のコールバック（分） */
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

export function DurationSelect({ value, onChange, disabled = false }: DurationSelectProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const display = useMemo(() => formatDurationDisplay(value), [value]);

  const handleSelect = useCallback(
    (minutes: number) => {
      onChange(minutes);
      setOpen(false);
    },
    [onChange],
  );

  // Popover 開いた時に現在値までスクロール
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    requestAnimationFrame(() => {
      const active = listRef.current?.querySelector('[data-active="true"]');
      active?.scrollIntoView({ block: 'center' });
    });
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            'text-muted-foreground data-[state=selected]:text-foreground',
            'hover:bg-state-hover inline-flex h-8 items-center rounded-lg px-2 text-sm tabular-nums transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
          data-state={value > 0 ? 'selected' : undefined}
        >
          {display || '--'}
        </button>
      </PopoverAnchor>

      <PopoverContent
        align="end"
        sideOffset={4}
        className="z-overlay-popover w-28 p-0"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
          {DURATION_OPTIONS.map((minutes) => {
            const isActive = minutes === value;
            return (
              <button
                key={minutes}
                type="button"
                data-active={isActive}
                onClick={() => handleSelect(minutes)}
                className={cn(
                  'w-full px-3 py-1.5 text-left text-sm tabular-nums transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-state-hover',
                )}
              >
                {formatDurationDisplay(minutes)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
