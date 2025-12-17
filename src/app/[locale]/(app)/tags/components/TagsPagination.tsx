'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { useTranslations } from 'next-intl'

interface TagsPaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  t: ReturnType<typeof useTranslations>
}

export function TagsPagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  t,
}: TagsPaginationProps) {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 左側: 表示件数選択 */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{t('tag.page.rowsPerPage')}</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 中央: ページ情報 */}
        <div className="text-muted-foreground text-sm">
          {totalItems > 0
            ? `${startIndex + 1}〜${Math.min(endIndex, totalItems)}件 ${t('tag.page.of')} ${totalItems}件`
            : '0件'}
        </div>

        {/* 右側: ページ移動ボタン */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">{t('tag.page.previous')}</span>
          </Button>
          <div className="text-muted-foreground flex h-8 items-center px-3 text-sm">
            {t('tag.page.page')} {currentPage} {t('tag.page.of')} {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">{t('tag.page.next')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
