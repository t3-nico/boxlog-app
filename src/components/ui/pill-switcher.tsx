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
      <TabsList className="bg-muted/50 h-8 gap-1 rounded-lg p-1">
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              'h-6 rounded-md px-3 text-xs font-medium transition-all',
              'text-muted-foreground',
              'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
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
