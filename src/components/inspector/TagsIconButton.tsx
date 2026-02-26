'use client';

import { useMemo } from 'react';

import { Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TagSelectCombobox } from '@/components/tags/TagSelectCombobox';
import { Badge } from '@/components/ui/badge';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTags } from '@/hooks/useTagsQuery';
import { cn } from '@/lib/utils';

import type { Tag as TagType } from '@/core/types/tag';

interface TagsIconButtonProps {
  /** 選択されているタグIDの配列 */
  tagIds: string[];
  /** タグ変更時のコールバック */
  onTagsChange: (tagIds: string[]) => void;
  /** Popoverの表示位置 */
  popoverSide?: 'top' | 'bottom';
  /** Inspector内で使う場合にtrue（z-overlay-popoverを適用） */
  isOverlay?: boolean;
  /** 外部からタグデータを注入（Storybook等で使用） */
  availableTags?: TagType[] | undefined;
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
  isOverlay = true,
  availableTags,
}: TagsIconButtonProps) {
  const t = useTranslations();
  const { data: fetchedTags = [] } = useTags();
  const allTags = availableTags ?? fetchedTags;

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
            className="h-7 gap-1 bg-transparent text-xs font-normal"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.id);
              }}
              className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </HoverTooltip>
      ))}

      {/* タグ追加ボタン */}
      <HoverTooltip content={t('plan.inspector.tags.add')} side="top">
        <TagSelectCombobox
          selectedTagIds={tagIds}
          onTagsChange={onTagsChange}
          side={popoverSide}
          sideOffset={8}
          isOverlay={isOverlay}
          {...(availableTags ? { availableTags } : {})}
        >
          <button
            type="button"
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              'text-muted-foreground hover:text-foreground',
            )}
            aria-label={t('plan.inspector.tags.add')}
          >
            <Tag className="size-4" />
          </button>
        </TagSelectCombobox>
      </HoverTooltip>
    </div>
  );
}
