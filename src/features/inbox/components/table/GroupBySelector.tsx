import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Group, X } from 'lucide-react'
import { useInboxGroupStore } from '../../stores/useInboxGroupStore'
import type { GroupByField } from '../../types/group'

/**
 * グループ化フィールドの設定
 */
const GROUP_BY_OPTIONS: Array<{
  value: GroupByField
  label: string
}> = [
  { value: null, label: 'なし' },
  { value: 'status', label: 'ステータス' },
  { value: 'due_date', label: '期限' },
  { value: 'tags', label: 'タグ' },
]

/**
 * Group By セレクター
 *
 * テーブルをグループ化するフィールドを選択するコンポーネント
 * - ステータス
 * - 期限
 * - タグ
 *
 * @example
 * ```tsx
 * <GroupBySelector />
 * ```
 */
export function GroupBySelector() {
  const { groupBy, setGroupBy } = useInboxGroupStore()

  const activeOption = GROUP_BY_OPTIONS.find((opt) => opt.value === groupBy)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Group className="size-4" />
          グループ化: {activeOption?.label || 'なし'}
          {groupBy && (
            <X
              className="size-3"
              onClick={(e) => {
                e.stopPropagation()
                setGroupBy(null)
              }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>グループ化</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {GROUP_BY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value || 'none'}
            onClick={() => setGroupBy(option.value)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {groupBy === option.value && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
