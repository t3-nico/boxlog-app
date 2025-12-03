'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/features/i18n/lib/hooks'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

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
 * ページ移動と表示件数変更の機能を提供
 * - ページ移動ボタン（最初/前/次/最後）
 * - 表示件数選択
 * - 現在のページ情報表示
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
  const { t } = useI18n()

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
    <div className="flex items-center justify-between px-6 py-4">
      {/* 左側: 表示件数選択 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{t('common.table.rowsPerPage')}</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-9 w-16">
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
        {totalItems > 0 ? (
          <>
            {startItem}〜{endItem}
            {t('common.table.items')} / {t('common.table.total')}
            {totalItems}
            {t('common.table.items')}
          </>
        ) : (
          <>0{t('common.table.items')}</>
        )}
      </div>

      {/* 右側: ページ移動ボタン */}
      <div className="flex items-center gap-1">
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
          >
            <ChevronsLeft className="size-4" />
            <span className="sr-only">{t('common.table.firstPage')}</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">{t('common.table.previousPage')}</span>
        </Button>
        <div className="text-muted-foreground flex h-9 items-center px-3 text-sm">
          {t('common.table.page')} {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">{t('common.table.nextPage')}</span>
        </Button>
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-9 w-9 p-0"
          >
            <ChevronsRight className="size-4" />
            <span className="sr-only">{t('common.table.lastPage')}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
