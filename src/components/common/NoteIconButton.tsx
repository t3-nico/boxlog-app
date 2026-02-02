'use client';

import { useState } from 'react';

import { FileText } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { SimpleDescriptionEditor } from '@/features/plans/components/shared/SimpleDescriptionEditor';
import { cn } from '@/lib/utils';

interface NoteIconButtonProps {
  /** エディタのキー用ID */
  id: string;
  /** メモ内容（HTML） */
  note: string;
  /** メモ変更時のコールバック */
  onNoteChange: (html: string) => void;
  /** 無効化フラグ */
  disabled?: boolean;
}

/**
 * メモ編集アイコンボタン
 *
 * Record用のコンパクトなメモ編集ボタン
 * SimpleDescriptionEditorを使用（Plan説明と同じエディタ）
 */
export function NoteIconButton({ id, note, onNoteChange, disabled = false }: NoteIconButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // メモがあるかどうか（空のHTMLタグを除外）
  const hasNote = note && note.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasNote ? 'メモを編集' : 'メモを追加'} side="top">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-8 items-center justify-center rounded-md px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasNote ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasNote ? 'メモを編集' : 'メモを追加'}
          >
            <FileText className="size-4" />
            {/* メモがある場合のインジケータードット */}
            {hasNote && (
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
          key={id}
          content={note}
          onChange={onNoteChange}
          placeholder="メモを追加..."
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
