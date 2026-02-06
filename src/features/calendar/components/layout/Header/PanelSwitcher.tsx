'use client';

import { useCallback } from 'react';

import { Check, ChevronDown, Columns } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type PanelType = 'none' | 'plan' | 'record' | 'stats';

export type PanelOption = {
  value: PanelType;
  label: string;
};

const panelOptions: PanelOption[] = [
  { value: 'none', label: 'None' },
  { value: 'plan', label: 'Plan' },
  { value: 'record', label: 'Record' },
  { value: 'stats', label: 'Stats' },
];

interface PanelSwitcherProps {
  currentPanel: PanelType;
  onChange: (panel: PanelType) => void;
  className?: string;
}

/**
 * サイドパネル切り替えドロップダウン
 * カレンダーの右側に表示するパネルを選択
 */
export function PanelSwitcher({ currentPanel, onChange, className }: PanelSwitcherProps) {
  const currentOption = panelOptions.find((opt) => opt.value === currentPanel);

  const handleSelect = useCallback(
    (value: PanelType) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'justify-start gap-2 text-sm',
          className,
        )}
      >
        <Columns className="h-4 w-4" />
        <span>{currentOption?.label || 'None'}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="min-w-32">
        {panelOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="flex items-center justify-between gap-2"
          >
            <span>{option.label}</span>
            {currentPanel === option.value && <Check className="text-primary h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
