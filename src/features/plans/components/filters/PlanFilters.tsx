'use client'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PlanStatus } from '../../types/plan'

interface TicketFiltersProps {
  searchQuery?: string
  status?: PlanStatus
  onSearchChange?: (query: string) => void
  onStatusChange?: (status: PlanStatus | undefined) => void
  onClearFilters?: () => void
}

export function PlanFilters({
  searchQuery = '',
  status,
  onSearchChange,
  onStatusChange,
  onClearFilters,
}: TicketFiltersProps) {
  const hasActiveFilters = searchQuery || status

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* 検索 */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="チケットを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ステータスフィルタ */}
      <Select
        value={status ?? 'all'}
        onValueChange={(v) => onStatusChange?.(v === 'all' ? undefined : (v as TicketStatus))}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="open">未着手</SelectItem>
          <SelectItem value="in_progress">進行中</SelectItem>
          <SelectItem value="completed">完了</SelectItem>
          <SelectItem value="cancelled">キャンセル</SelectItem>
        </SelectContent>
      </Select>

      {/* フィルタクリア */}
      {hasActiveFilters && onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          クリア
        </Button>
      )}
    </div>
  )
}
