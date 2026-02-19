'use client';

/**
 * テキスト編集アイコンボタン（共通コンポーネント）
 *
 * Plan/Record共通で使用するリッチテキスト編集ボタン
 * - メモ（Record）
 * - 説明（Plan）
 */

import { useState } from 'react';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SimpleDescriptionEditor } from '@/components/ui/simple-description-editor';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

interface NoteIconButtonProps {
  /** エディタのキー用ID */
  id: string;
  /** 内容（HTML） */
  note: string;
  /** 変更時のコールバック */
  onNoteChange: (html: string) => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ラベル（カスタマイズ用） */
  labels?: {
    /** 内容がある時のツールチップ */
    editTooltip?: string;
    /** 内容がない時のツールチップ */
    addTooltip?: string;
    /** プレースホルダー */
    placeholder?: string;
  };
}

/**
 * NoteIconButton
 *
 * リッチテキスト編集用のコンパクトなアイコンボタン
 * Plan/Record両方で使用可能（labelsでカスタマイズ）
 */
export function NoteIconButton({
  id,
  note,
  onNoteChange,
  disabled = false,
  labels = {},
}: NoteIconButtonProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  // デフォルトラベル（labels未指定時はi18nフォールバック）
  const editTooltip = labels.editTooltip ?? t('common.note.edit');
  const addTooltip = labels.addTooltip ?? t('common.note.add');
  const placeholder = labels.placeholder ?? t('common.note.placeholder');

  // 内容があるかどうか（空のHTMLタグを除外）
  const hasContent = note && note.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasContent ? editTooltip : addTooltip} side="top">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-8 items-center justify-center rounded-lg px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasContent ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasContent ? editTooltip : addTooltip}
          >
            <FileText className="size-4" />
            {/* 内容がある場合のインジケータードット */}
            {hasContent && (
              <span className="bg-primary absolute -top-1 -right-0.5 size-2 rounded-full" />
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
          placeholder={placeholder}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
