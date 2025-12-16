'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type TodoFilter = 'all' | 'today' | 'overdue'
export type TodoSort = 'due' | 'priority' | 'created'

interface TodoNavigationProps {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  sort: TodoSort
  onSortChange: (sort: TodoSort) => void
}

/**
 * TodoNavigation - Todoタブのフィルター・ソート設定
 *
 * **構成**:
 * - 期間フィルター: ドロップダウンボタン（All / Today / Overdue）
 * - ソート順: ドロップダウンボタン（Due / Priority / Created）
 *
 * **Note**: 優先度フィルターはDBスキーマにpriorityフィールドが
 * 追加された後に実装予定
 */
export function TodoNavigation({ filter, onFilterChange, sort, onSortChange }: TodoNavigationProps) {
  const t = useTranslations('calendar.todo.navigation')

  // フィルターラベルのマッピング
  const filterLabels: Record<TodoFilter, string> = {
    all: t('all'),
    today: t('today'),
    overdue: t('overdue'),
  }

  // ソートラベルのマッピング
  const sortLabels: Record<TodoSort, string> = {
    due: t('dueDate'),
    priority: t('priority'),
    created: t('created'),
  }

  return (
    <div className="flex items-center gap-1">
      {/* 期間フィルター */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <span>{filterLabels[filter]}</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup value={filter} onValueChange={(value) => onFilterChange(value as TodoFilter)}>
            <DropdownMenuRadioItem value="all">{t('all')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="today">{t('today')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="overdue">{t('overdue')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ソート順 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
            <span>{sortLabels[sort]}</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup value={sort} onValueChange={(value) => onSortChange(value as TodoSort)}>
            <DropdownMenuRadioItem value="due">{t('dueDate')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="priority">{t('priority')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">{t('created')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
