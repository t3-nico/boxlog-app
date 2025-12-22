'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useKanbanStore } from '../stores/useKanbanStore'

/**
 * Kanbanボード用ツールバー
 *
 * 検索、フィルター、ソート機能を提供
 */
export function KanbanToolbar() {
  const { filter, setFilter, clearFilter, sort, setSort } = useKanbanStore()
  const t = useTranslations()

  const isFiltered = Object.keys(filter).length > 0

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 優先度フィルター */}
        <Select
          value={filter.priority ?? 'all'}
          onValueChange={(value) =>
            setFilter({ priority: value === 'all' ? undefined : (value as 'low' | 'medium' | 'high') })
          }
        >
          <SelectTrigger className="h-10 w-28 sm:h-8 sm:w-32">
            <SelectValue placeholder={t('board.toolbar.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t('board.toolbar.priority')}</SelectLabel>
              <SelectItem value="all">{t('board.toolbar.all')}</SelectItem>
              <SelectItem value="low">{t('board.toolbar.low')}</SelectItem>
              <SelectItem value="medium">{t('board.toolbar.medium')}</SelectItem>
              <SelectItem value="high">{t('board.toolbar.high')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* ソート */}
        <Select
          value={`${sort.key}-${sort.order}`}
          onValueChange={(value) => {
            const [key, order] = value.split('-') as [typeof sort.key, typeof sort.order]
            setSort({ key, order })
          }}
        >
          <SelectTrigger className="h-10 w-32 sm:h-8 sm:w-36">
            <SelectValue placeholder={t('board.toolbar.sort')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t('board.toolbar.sort')}</SelectLabel>
              <SelectItem value="createdAt-desc">{t('board.toolbar.createdAtDesc')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('board.toolbar.createdAtAsc')}</SelectItem>
              <SelectItem value="updatedAt-desc">{t('board.toolbar.updatedAtDesc')}</SelectItem>
              <SelectItem value="updatedAt-asc">{t('board.toolbar.updatedAtAsc')}</SelectItem>
              <SelectItem value="priority-desc">{t('board.toolbar.priorityDesc')}</SelectItem>
              <SelectItem value="priority-asc">{t('board.toolbar.priorityAsc')}</SelectItem>
              <SelectItem value="title-asc">{t('board.toolbar.titleAsc')}</SelectItem>
              <SelectItem value="title-desc">{t('board.toolbar.titleDesc')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilter} className="h-10 px-2 sm:h-8 lg:px-3">
            {t('board.toolbar.reset')}
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* 右側アクション */}
      <div className="flex items-center gap-2">
        <Button variant="primary">
          <Plus className="mr-2 size-4" />
          {t('board.toolbar.addCard')}
        </Button>
      </div>
    </div>
  )
}
