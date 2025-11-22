'use client'

import { Badge } from '@/components/ui/badge'
import { TicketTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced'
import { Tag } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * タグフィルターボタン（Table専用）
 *
 * TicketTagSelectDialogEnhanced を使用してタグフィルターを提供
 * - タグ複数選択（グループ・検索・アーカイブ対応）
 * - フィルター数のバッジ表示
 *
 * @example
 * ```tsx
 * <TagFilterButton />
 * ```
 */
export function TagFilterButton() {
  const { tags, setTags } = useInboxFilterStore()

  const tagFilterCount = tags.length

  return (
    <TicketTagSelectDialogEnhanced
      selectedTagIds={tags}
      onTagsChange={setTags}
      align="start"
      side="bottom"
      sideOffset={8}
    >
      <button
        type="button"
        className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <Tag />
        タグ
        {tagFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2 px-1 text-xs">
            {tagFilterCount}
          </Badge>
        )}
      </button>
    </TicketTagSelectDialogEnhanced>
  )
}
