'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlanTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced'
import { Tag } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * タグフィルターボタン（Table専用）
 *
 * PlanTagSelectDialogEnhanced を使用してタグフィルターを提供
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
    <PlanTagSelectDialogEnhanced
      selectedTagIds={tags}
      onTagsChange={setTags}
      align="start"
      side="bottom"
      sideOffset={8}
    >
      <Button variant="outline" size="default">
        <Tag />
        タグ
        {tagFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2 px-1 text-xs">
            {tagFilterCount}
          </Badge>
        )}
      </Button>
    </PlanTagSelectDialogEnhanced>
  )
}
