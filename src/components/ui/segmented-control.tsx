'use client';

import { useCallback } from 'react';

import { cn } from '@/lib/utils';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string | undefined;
}

/**
 * セグメントコントロール。2〜4個の選択肢を横並びで表示し1つを選択するUI。PanelSwitcher、Inspector等で使用。
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const handleSelect = useCallback(
    (selected: T) => {
      onChange(selected);
    },
    [onChange],
  );

  return (
    <div className={cn('flex h-8 items-center', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={cn(
            'relative rounded-md px-3 py-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors',
            value === option.value
              ? 'text-foreground after:bg-foreground'
              : 'text-muted-foreground hover:bg-state-hover hover:text-foreground after:bg-transparent',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
