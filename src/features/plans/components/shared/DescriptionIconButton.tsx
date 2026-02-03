'use client';

import { useState } from 'react';

import { FileText } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

import { SimpleDescriptionEditor } from './SimpleDescriptionEditor';

interface DescriptionIconButtonProps {
  /** Plan ID（エディタのキー用） */
  planId: string;
  /** 説明文（HTML） */
  description: string;
  /** 説明文変更時のコールバック */
  onDescriptionChange: (html: string) => void;
  /** 無効化フラグ */
  disabled?: boolean;
}

/**
 * 説明文編集アイコンボタン
 *
 * Toggl風Row 3で使用するコンパクトな説明文編集ボタン
 */
export function DescriptionIconButton({
  planId,
  description,
  onDescriptionChange,
  disabled = false,
}: DescriptionIconButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 説明文があるかどうか（空のHTMLタグを除外）
  const hasDescription = description && description.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasDescription ? '説明を編集' : '説明を追加'} side="top">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-8 items-center justify-center rounded-lg px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasDescription ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasDescription ? '説明を編集' : '説明を追加'}
          >
            <FileText className="size-4" />
            {/* 説明がある場合のインジケータードット */}
            {hasDescription && (
              <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />
            )}
          </button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent
        className="w-96 p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        style={{ zIndex: zIndex.overlayDropdown }}
      >
        <SimpleDescriptionEditor
          key={planId}
          content={description}
          onChange={onDescriptionChange}
          placeholder="説明を追加..."
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
