import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useInboxGroupStore } from '../../stores/useInboxGroupStore'

interface GroupHeaderProps {
  /** グループキー */
  groupKey: string
  /** グループラベル */
  groupLabel: string
  /** グループ内のアイテム数 */
  count: number
  /** 列数（colSpan用） */
  columnCount: number
}

/**
 * グループヘッダー
 *
 * グループ化されたテーブルのグループ見出し行
 * - クリックで折りたたみ/展開
 * - アイテム数表示
 *
 * @example
 * ```tsx
 * <GroupHeader
 *   groupKey="active"
 *   groupLabel="作業中"
 *   count={5}
 *   columnCount={7}
 * />
 * ```
 */
export function GroupHeader({ groupKey, groupLabel, count, columnCount }: GroupHeaderProps) {
  const { collapsedGroups, toggleGroupCollapse } = useInboxGroupStore()
  const isCollapsed = collapsedGroups.has(groupKey)

  return (
    <TableRow
      className="bg-surface-container hover:bg-state-hover cursor-pointer border-y"
      onClick={() => toggleGroupCollapse(groupKey)}
    >
      <TableCell colSpan={columnCount} className="py-3">
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          <span className="font-semibold">{groupLabel}</span>
          <Badge variant="secondary" className="ml-1">
            {count}
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  )
}
