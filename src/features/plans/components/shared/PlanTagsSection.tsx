'use client';

import { Badge } from '@/components/ui/badge';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useTags } from '@/features/tags/hooks/useTags';
import { Plus, Tag, X } from 'lucide-react';

import { PlanTagSelectDialogEnhanced } from './PlanTagSelectDialogEnhanced';

interface PlanTagsSectionProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onRemoveTag?: (tagId: string) => void;
  showBorderTop?: boolean;
  popoverAlign?: 'start' | 'center' | 'end';
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  popoverAlignOffset?: number;
  popoverSideOffset?: number;
}

export function PlanTagsSection({
  selectedTagIds,
  onTagsChange,
  onRemoveTag,
  showBorderTop = false,
  popoverAlign,
  popoverSide,
  popoverAlignOffset,
  popoverSideOffset,
}: PlanTagsSectionProps) {
  // データベースからタグを取得
  const { data: allTags = [] } = useTags();

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <div
      className={`flex min-h-10 items-start gap-2 px-4 py-2 ${showBorderTop ? 'border-border/50 border-t' : ''}`}
    >
      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
        <Tag className="text-muted-foreground size-4" />
      </div>
      <div className="flex min-h-8 flex-1 items-center">
        <div className="flex max-h-[5.25rem] flex-wrap items-center gap-1.5 overflow-y-auto">
          {/* 選択済みタグを表示 */}
          {selectedTags.map((tag) => {
            const badgeContent = (
              <Badge
                variant="outline"
                style={{
                  borderColor: tag.color || undefined,
                }}
                className="group relative gap-0.5 pr-6 text-xs font-normal"
              >
                <span className="font-medium" style={{ color: tag.color || undefined }}>
                  #
                </span>
                {tag.name}
                {onRemoveTag && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTag(tag.id);
                    }}
                    className="hover:bg-state-hover absolute top-1/2 right-1 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );

            return (
              <HoverTooltip
                key={tag.id}
                content={tag.description}
                side="top"
                disabled={!tag.description}
              >
                {badgeContent}
              </HoverTooltip>
            );
          })}

          {/* タグ選択ダイアログ */}
          <PlanTagSelectDialogEnhanced
            selectedTagIds={selectedTagIds}
            onTagsChange={onTagsChange}
            align={popoverAlign}
            side={popoverSide}
            alignOffset={popoverAlignOffset}
            sideOffset={popoverSideOffset}
          >
            {selectedTagIds.length === 0 ? (
              <button
                type="button"
                className="text-muted-foreground hover:bg-state-hover h-8 rounded-md px-2 text-sm transition-colors"
              >
                タグを追加...
              </button>
            ) : (
              <button
                type="button"
                className="text-muted-foreground hover:bg-state-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              >
                <Plus className="size-4" />
              </button>
            )}
          </PlanTagSelectDialogEnhanced>
        </div>
      </div>
    </div>
  );
}
