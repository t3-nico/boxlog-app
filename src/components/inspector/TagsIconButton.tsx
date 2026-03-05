'use client';

import { useMemo } from 'react';

import { Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TagSelectCombobox } from '@/components/tags/TagSelectCombobox';
import { Badge } from '@/components/ui/badge';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTags } from '@/hooks/useTagsQuery';
import { getTagDisplayLabel } from '@/lib/tag-colon';
import { cn } from '@/lib/utils';

import type { Tag as TagType } from '@/core/types/tag';

interface TagsIconButtonProps {
  /** 選択されているタグID（単一） */
  tagId: string | null;
  /** タグ変更時のコールバック */
  onTagChange: (tagId: string | null) => void;
  /** Popoverの表示位置 */
  popoverSide?: 'top' | 'bottom';
  /** Inspector内で使う場合にtrue（z-overlay-popoverを適用） */
  isOverlay?: boolean;
  /** 外部からタグデータを注入（Storybook等で使用） */
  availableTags?: TagType[] | undefined;
}

/**
 * タグインライン表示 + アイコンボタン（単一タグ）
 *
 * 選択済みタグをBadgeで表示し、Tagアイコンで追加/変更Popover
 */
export function TagsIconButton({
  tagId,
  onTagChange,
  popoverSide = 'bottom',
  isOverlay = true,
  availableTags,
}: TagsIconButtonProps) {
  const t = useTranslations();
  const { data: fetchedTags = [] } = useTags();
  const allTags = availableTags ?? fetchedTags;

  // 選択済みタグ
  const selectedTag = useMemo(() => {
    if (!tagId) return null;
    return allTags.find((tag) => tag.id === tagId) ?? null;
  }, [tagId, allTags]);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* 選択済みタグ（Badge表示） */}
      {selectedTag && (
        <HoverTooltip content={selectedTag.name} side="top" disabled={false}>
          <Badge
            variant="outline"
            style={{ borderColor: selectedTag.color || undefined }}
            className="h-7 gap-1 bg-transparent text-xs font-normal"
          >
            {getTagDisplayLabel(selectedTag.name)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagChange(null);
              }}
              className="hover:bg-state-hover text-muted-foreground hover:text-foreground -mr-1 rounded p-0.5 transition-colors"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </HoverTooltip>
      )}

      {/* タグ追加ボタン */}
      <HoverTooltip content={t('plan.inspector.tags.add')} side="top">
        <TagSelectCombobox
          selectedTagId={tagId}
          onTagChange={onTagChange}
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
