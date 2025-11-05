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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useInboxPaginationStore } from '../../stores/useInboxPaginationStore'

interface TablePaginationProps {
  /** 総件数 */
  totalItems: number
}

/**
 * テーブルページネーションコンポーネント
 *
 * ページ移動と表示件数変更の機能を提供
 * - ページ移動ボタン（最初/前/次/最後）
 * - 表示件数選択（10/25/50/100）
 * - 現在のページ情報表示
 *
 * @example
 * ```tsx
 * <TablePagination totalItems={100} />
 * ```
 */
export function TablePagination({ totalItems }: TablePaginationProps) {
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useInboxPaginationStore()

  // 総ページ数
  const totalPages = Math.ceil(totalItems / pageSize)

  // 現在のページの範囲
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // ページ移動ハンドラー
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => setCurrentPage(totalPages)

  // ページサイズ変更ハンドラー
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-6">
      {/* 左側: 表示件数選択 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">表示件数</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-9 w-[64px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>件数</SelectLabel>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 中央: ページ情報 */}
      <div className="text-muted-foreground text-sm">
        {totalItems > 0 ? (
          <>
            {startItem}〜{endItem}件 / 全{totalItems}件
          </>
        ) : (
          <>0件</>
        )}
      </div>

      {/* 右側: ページ移動ボタン */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronsLeft className="size-4" />
          <span className="sr-only">最初のページ</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">前のページ</span>
        </Button>
        <div className="text-muted-foreground flex h-9 items-center px-3 text-sm">
          ページ {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">次のページ</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-9 w-9 p-0"
        >
          <ChevronsRight className="size-4" />
          <span className="sr-only">最後のページ</span>
        </Button>
      </div>
    </div>
  )
}
