'use client'

import * as React from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export interface PillSwitcherOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface PillSwitcherProps<T extends string = string> {
  options: PillSwitcherOption<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
}

/**
 * Pill Switcher Component
 *
 * pill形式のタブ切り替えコンポーネント
 * - 選択中: bg-secondary + text-secondary-foreground
 * - 非選択ホバー: bg-foreground/8
 *
 * @example
 * ```tsx
 * <PillSwitcher
 *   options={[
 *     { value: 'all', label: 'すべて' },
 *     { value: 'unread', label: '未読' },
 *   ]}
 *   value={currentValue}
 *   onValueChange={setValue}
 * />
 * ```
 */
export function PillSwitcher<T extends string = string>({
  options,
  value,
  onValueChange,
  className,
}: PillSwitcherProps<T>) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as T)} className={className}>
      <TabsList className="h-8 rounded-lg bg-transparent p-0.5">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              'h-7 rounded-md px-3 text-xs',
              'data-[state=inactive]:hover:bg-state-hover',
              'data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground',
              option.icon && 'gap-1.5'
            )}
          >
            {option.icon}
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
