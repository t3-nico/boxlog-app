'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TablePaginationProps {
  /** 総件数 */
  totalItems: number
  /** 現在のページ（1始まり） */
  currentPage: number
  /** 1ページあたりの表示件数 */
  pageSize: number
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void
  /** 表示件数変更時のコールバック */
  onPageSizeChange: (size: number) => void
  /** 表示件数の選択肢 */
  pageSizeOptions?: number[]
  /** 最初/最後へのジャンプボタンを表示するか */
  showFirstLastButtons?: boolean
}

/**
 * 共通テーブルページネーションコンポーネント
 *
 * **設計方針:**
 * - デスクトップ専用（モバイルでは親コンポーネントで非表示にする）
 * - タスク管理アプリでは通常データ量が少ないため、モバイルでは全件表示が適切
 *
 * @see https://baymard.com/blog/mobile-app-ux-trends
 */
export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showFirstLastButtons = true,
}: TablePaginationProps) {
  const t = useTranslations()

  // 総ページ数
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  // 現在のページの範囲
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // ページ移動ハンドラー
  const goToFirstPage = () => onPageChange(1)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => onPageChange(totalPages)

  // ページサイズ変更ハンドラー
  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number(value))
  }

  return (
    <div className="flex items-center justify-between px-4 py-4">
      {/* 左側: 表示件数選択 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{t('table.rowsPerPage')}</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-[72px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 中央: ページ情報 */}
      <div className="text-muted-foreground text-sm">
        {totalItems > 0
          ? t('table.items', { start: startItem, end: endItem, total: totalItems })
          : t('table.items', { start: 0, end: 0, total: 0 })}
      </div>

      {/* 右側: ページ移動ボタン */}
      <div className="flex items-center gap-1">
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            className="size-8 p-0"
          >
            <ChevronsLeft className="size-4" />
            <span className="sr-only">{t('table.firstPage')}</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="size-8 p-0"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">{t('table.previousPage')}</span>
        </Button>
        <div className="text-muted-foreground flex h-8 items-center px-2 text-sm">
          {t('table.page', { current: currentPage, total: totalPages })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="size-8 p-0"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">{t('table.nextPage')}</span>
        </Button>
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="size-8 p-0"
          >
            <ChevronsRight className="size-4" />
            <span className="sr-only">{t('table.lastPage')}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
