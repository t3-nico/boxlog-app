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
import { Calendar, Download, Filter, X } from 'lucide-react'

/**
 * 統計ページ用ツールバー
 *
 * 期間選択、フィルター機能を提供
 */
export function StatsToolbar() {
  return (
    <div className="flex w-full items-center justify-between gap-4 px-6 py-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 期間選択 */}
        <Select defaultValue="week">
          <SelectTrigger className="h-9 w-[140px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="期間" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>期間</SelectLabel>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">今週</SelectItem>
              <SelectItem value="month">今月</SelectItem>
              <SelectItem value="year">今年</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* カテゴリフィルター */}
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>カテゴリ</SelectLabel>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="work">仕事</SelectItem>
              <SelectItem value="personal">プライベート</SelectItem>
              <SelectItem value="study">学習</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* フィルターリセット */}
        <Button variant="ghost" className="h-9 px-2 lg:px-3">
          リセット
          <X className="ml-2 size-4" />
        </Button>
      </div>

      {/* 右側アクション */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-2 size-4" />
          エクスポート
        </Button>
      </div>
    </div>
  )
}
