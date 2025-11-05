import { TableHead } from '@/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useInboxSortStore, type SortField } from '../../stores/useInboxSortStore'

interface SortableTableHeadProps {
  /** ソート対象フィールド */
  field: SortField
  /** 表示ラベル */
  children: React.ReactNode
  /** カスタムクラス名 */
  className?: string
}

/**
 * ソート可能なテーブルヘッダー
 *
 * クリックでソート順を切り替える（asc → desc → null）
 *
 * @example
 * ```tsx
 * <SortableTableHead field="title" className="min-w-[200px]">
 *   タイトル
 * </SortableTableHead>
 * ```
 */
export function SortableTableHead({ field, children, className }: SortableTableHeadProps) {
  const { sortField, sortDirection, setSortField } = useInboxSortStore()

  const isActive = sortField === field
  const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => setSortField(field)}
        className="hover:text-foreground flex items-center gap-2 transition-colors"
      >
        <span>{children}</span>
        <Icon className={`size-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
      </button>
    </TableHead>
  )
}
