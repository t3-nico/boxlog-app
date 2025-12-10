'use client'

import { ArrowUpDown, Clock, ListFilter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

export type TodoFilter = 'all' | 'today' | 'overdue'
export type TodoSort = 'due' | 'priority' | 'created'

interface TodoNavigationProps {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  sort: TodoSort
  onSortChange: (sort: TodoSort) => void
  showHigh: boolean
  showMedium: boolean
  showLow: boolean
  onPriorityToggle: (priority: 'high' | 'medium' | 'low') => void
}

/**
 * TodoNavigation - Todoタブのフィルター・ソート・優先度設定
 *
 * **構成**:
 * - Clock icon: 期間フィルター（All / Today / Overdue）
 * - ArrowUpDown icon: ソート順（Due / Priority / Created）
 * - ListFilter icon: 優先度フィルター（High / Medium / Low）
 */
export function TodoNavigation({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  showHigh,
  showMedium,
  showLow,
  onPriorityToggle,
}: TodoNavigationProps) {
  return (
    <div className="flex items-center gap-1">
      {/* 期間フィルター */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <Clock className="size-4" />
            <span className="sr-only">Time filter</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Period</h4>
            <Separator />
            <RadioGroup value={filter} onValueChange={(value) => onFilterChange(value as TodoFilter)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm font-normal">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today" className="text-sm font-normal">
                  Today
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overdue" id="overdue" />
                <Label htmlFor="overdue" className="text-sm font-normal">
                  Overdue
                </Label>
              </div>
            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>

      {/* ソート順 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <ArrowUpDown className="size-4" />
            <span className="sr-only">Sort order</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Sort by</h4>
            <Separator />
            <RadioGroup value={sort} onValueChange={(value) => onSortChange(value as TodoSort)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="due" id="due" />
                <Label htmlFor="due" className="text-sm font-normal">
                  Due date
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="priority" id="priority" />
                <Label htmlFor="priority" className="text-sm font-normal">
                  Priority
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="created" id="created" />
                <Label htmlFor="created" className="text-sm font-normal">
                  Created
                </Label>
              </div>
            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>

      {/* 優先度フィルター */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <ListFilter className="size-4" />
            <span className="sr-only">Priority filter</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Priority</h4>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="high" checked={showHigh} onCheckedChange={() => onPriorityToggle('high')} />
                <Label htmlFor="high" className="text-sm font-normal">
                  High
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="medium" checked={showMedium} onCheckedChange={() => onPriorityToggle('medium')} />
                <Label htmlFor="medium" className="text-sm font-normal">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="low" checked={showLow} onCheckedChange={() => onPriorityToggle('low')} />
                <Label htmlFor="low" className="text-sm font-normal">
                  Low
                </Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
