'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface TableFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** フィルターの内容（カスタム） */
  children?: React.ReactNode
  /** アクティブなフィルターがあるか */
  hasActiveFilters?: boolean | undefined
  /** フィルターリセットハンドラー */
  onReset?: (() => void) | undefined
}

/**
 * テーブル用フィルターシート
 *
 * モバイル・PC共通で使用可能なボトムシート形式のフィルターUI
 * 各テーブルのフィルター内容はchildrenとして渡す
 *
 * @example
 * ```tsx
 * <TableFilterSheet
 *   open={showFilterSheet}
 *   onOpenChange={setShowFilterSheet}
 *   hasActiveFilters={hasFilters}
 *   onReset={resetFilters}
 * >
 *   <MyFilterContent />
 * </TableFilterSheet>
 * ```
 */
export function TableFilterSheet({ open, onOpenChange, children, hasActiveFilters, onReset }: TableFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle>フィルター</SheetTitle>
          {hasActiveFilters && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-auto p-0 text-xs">
              リセット
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
