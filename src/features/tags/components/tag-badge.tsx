'use client';

import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Tag } from '../types';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onRemove?: () => void;
  /** tooltipを無効にする（デフォルト: descriptionがあれば表示） */
  disableTooltip?: boolean;
}

/**
 * タグバッジ
 *
 * タグをアウトラインバッジとして表示。
 * ボーダー色にタグのカラーを使用。
 * descriptionがあればホバーでtooltip表示。
 *
 * @example
 * ```tsx
 * <TagBadge tag={tag} />
 * <TagBadge tag={tag} onRemove={() => handleRemove(tag.id)} />
 * ```
 */
export function TagBadge({ tag, onClick, onRemove, disableTooltip }: TagBadgeProps) {
  return (
    <HoverTooltip
      content={tag.description}
      side="top"
      disabled={disableTooltip || !tag.description}
    >
      <Badge
        variant="outline"
        className={cn(
          'relative h-7 text-xs font-normal transition-colors',
          onClick && 'hover:bg-state-hover cursor-pointer',
          onRemove && 'pr-6',
        )}
        style={{ borderColor: tag.color || undefined }}
        onClick={onClick}
      >
        {tag.name}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="hover:bg-state-hover absolute top-1/2 right-1 -translate-y-1/2 rounded opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        )}
      </Badge>
    </HoverTooltip>
  );
}
