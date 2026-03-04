'use client';

/**
 * Inspector タグ表示行
 *
 * カラードット + タグ名を表示し、タップで TagSelectCombobox を開く。
 * タグ未設定時は「+ タグを追加」を表示。
 */

import { ChevronDown, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TagSelectCombobox } from '@/components/tags/TagSelectCombobox';
import type { Tag } from '@/core/types/tag';
import { useTagsMap } from '@/hooks/useTagsMap';

interface InspectorTagRowProps {
  tagId: string | null;
  onTagChange: (tagId: string | null) => void;
  availableTags?: Tag[];
}

export function InspectorTagRow({ tagId, onTagChange, availableTags }: InspectorTagRowProps) {
  const t = useTranslations();
  const { getTagById } = useTagsMap();

  const tag = tagId ? getTagById(tagId) : undefined;
  const tagColor = tag?.color || 'var(--muted-foreground)';

  return (
    <div className="px-4 pt-4 pb-2">
      <TagSelectCombobox
        selectedTagId={tagId}
        onTagChange={onTagChange}
        side="bottom"
        align="start"
        isOverlay
        {...(availableTags ? { availableTags } : {})}
      >
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2.5 text-xl font-bold transition-colors"
          aria-label={tag ? `${t('common.tags.change')}: ${tag.name}` : t('common.tags.add')}
        >
          {tag ? (
            <>
              <span
                className="inline-block size-4 flex-shrink-0 rounded-full"
                style={{ backgroundColor: tagColor }}
                aria-hidden
              />
              <span className="text-foreground">{tag.name}</span>
              <ChevronDown className="text-muted-foreground size-5 flex-shrink-0" aria-hidden />
            </>
          ) : (
            <>
              <Plus className="size-4 flex-shrink-0" aria-hidden />
              <span>{t('common.tags.add')}</span>
              <ChevronDown className="size-5 flex-shrink-0" aria-hidden />
            </>
          )}
        </button>
      </TagSelectCombobox>
    </div>
  );
}
