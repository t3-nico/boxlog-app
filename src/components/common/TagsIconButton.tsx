'use client';

import { useMemo } from 'react';

import { Tag, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex as defaultZIndex } from '@/config/ui/z-index';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { useTags } from '@/features/tags/hooks';
import { cn } from '@/lib/utils';

interface TagsIconButtonProps {
  /** 選択されているタグIDの配列 */
  tagIds: string[];
  /** タグ変更時のコールバック */
  onTagsChange: (tagIds: string[]) => void;
  /** Popoverの表示位置 */
  popoverSide?: 'top' | 'bottom';
  /** PopoverのzIndex */
  popoverZIndex?: number;
}

/**
 * タグインライン表示 + アイコンボタン
 *
 * Row 3用。選択済みタグをBadgeで表示し、
 * - タグあり: Tagアイコンクリックで追加Popover
 * - タグなし: "タグを追加..."テキストクリックで追加Popover
 */
export function TagsIconButton({
  tagIds,
  onTagsChange,
  popoverSide = 'bottom',
  popoverZIndex = defaultZIndex.overlayDropdown,
}: TagsIconButtonProps) {
  const { data: allTags = [] } = useTags();

  // 選択済みタグ
  const selectedTags = useMemo(() => {
    return tagIds
      .map((id) => allTags.find((tag) => tag.id === id))
      .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
  }, [tagIds, allTags]);

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* 選択済みタグ（Badge表示） */}
      {selectedTags.map((tag) => (
        <HoverTooltip key={tag.id} content={tag.description} side="top" disabled={!tag.description}>
          <Badge
            variant="outline"
            style={{ borderColor: tag.color || undefined }}
            className="group relative h-7 pr-6 text-xs font-normal"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.id);
              }}
              className="hover:bg-state-hover absolute top-1/2 right-1 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </HoverTooltip>
      ))}

      {/* タグ追加ボタン */}
      <HoverTooltip content="タグを追加" side="top">
        <TagSelectCombobox
          selectedTagIds={tagIds}
          onTagsChange={onTagsChange}
          side={popoverSide}
          sideOffset={8}
          zIndex={popoverZIndex}
        >
          <button
            type="button"
            className={cn(
              'flex size-8 items-center justify-center rounded-md transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              'text-muted-foreground hover:text-foreground',
            )}
            aria-label="タグを追加"
          >
            <Tag className="size-4" />
          </button>
        </TagSelectCombobox>
      </HoverTooltip>
    </div>
  );
}
