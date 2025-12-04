'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell } from '@/components/ui/table'
import { PlanStatusBadge } from '@/features/plans/components/display/PlanStatusBadge'
import type { PlanStatus } from '@/features/plans/types/plan'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useState } from 'react'

interface StatusEditCellProps {
  /** 現在のステータス */
  status: PlanStatus
  /** 列幅 */
  width?: number | undefined
  /** ステータス変更時のコールバック */
  onStatusChange: (status: PlanStatus) => void
}

const STATUS_OPTIONS: { value: PlanStatus; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
]

/**
 * ステータス編集可能セル
 *
 * クリックでポップオーバーを開き、ステータスを変更可能
 * - ホバーで編集可能であることを示す
 * - クリックでステータス選択UI表示
 * - 行クリックイベントの伝播を防止
 *
 * @example
 * ```tsx
 * <StatusEditCell
 *   status={item.status}
 *   width={column?.width}
 *   onStatusChange={(newStatus) => updateStatus(item.id, newStatus)}
 * />
 * ```
 */
export function StatusEditCell({ status, width, onStatusChange }: StatusEditCellProps) {
  const [open, setOpen] = useState(false)

  const handleStatusSelect = (newStatus: PlanStatus) => {
    onStatusChange(newStatus)
    setOpen(false)
  }

  const style = width ? { width: `${width}px` } : undefined

  return (
    <TableCell
      onClick={(e) => e.stopPropagation()}
      className="group hover:bg-muted cursor-pointer transition-colors"
      style={style}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center">
            <PlanStatusBadge status={status} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusSelect(option.value)}
                className={cn(
                  'hover:bg-foreground/8 flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
                  status === option.value && 'bg-muted'
                )}
              >
                <div className="flex size-4 items-center justify-center">
                  {status === option.value && <Check className="size-4" />}
                </div>
                <PlanStatusBadge status={option.value} />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  )
}
