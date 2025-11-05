'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { X } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * Tableビュー用ツールバー
 *
 * 検索、ステータスフィルター機能を提供
 */
export function TableToolbar() {
  const { search, status, setSearch, setStatus, reset } = useInboxFilterStore()

  const isFiltered = search !== '' || status.length > 0

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 検索 */}
        <Input
          placeholder="チケットを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-[150px] lg:w-[250px]"
        />

        {/* ステータスフィルター */}
        <Select
          value={status?.[0] ?? 'all'}
          onValueChange={(value) => setStatus(value === 'all' ? [] : ([value] as TicketStatus[]))}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>ステータス</SelectLabel>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="backlog">準備中</SelectItem>
              <SelectItem value="ready">配置済み</SelectItem>
              <SelectItem value="active">作業中</SelectItem>
              <SelectItem value="wait">待ち</SelectItem>
              <SelectItem value="done">完了</SelectItem>
              <SelectItem value="cancel">中止</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
