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
import { useKanbanStore } from '../stores/useKanbanStore'

/**
 * Kanbanボード用ツールバー
 *
 * 検索、フィルター、ソート機能を提供
 */
export function KanbanToolbar() {
  const { filter, setFilter, clearFilter, sort, setSort } = useKanbanStore()

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
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="優先度" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>優先度</SelectLabel>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
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
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>並び替え</SelectLabel>
              <SelectItem value="createdAt-desc">作成日（新しい順）</SelectItem>
              <SelectItem value="createdAt-asc">作成日（古い順）</SelectItem>
              <SelectItem value="updatedAt-desc">更新日（新しい順）</SelectItem>
              <SelectItem value="updatedAt-asc">更新日（古い順）</SelectItem>
              <SelectItem value="priority-desc">優先度（高い順）</SelectItem>
              <SelectItem value="priority-asc">優先度（低い順）</SelectItem>
              <SelectItem value="title-asc">タイトル（A-Z）</SelectItem>
              <SelectItem value="title-desc">タイトル（Z-A）</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilter} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* 右側アクション */}
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="h-9">
          <Plus className="mr-2 size-4" />
          カード追加
        </Button>
      </div>
    </div>
  )
}
