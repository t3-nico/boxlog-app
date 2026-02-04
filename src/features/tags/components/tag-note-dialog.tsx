'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useDialogKeyboard } from '@/hooks/useDialogKeyboard';
import { useTranslations } from 'next-intl';

const MAX_LENGTH = 100;

interface TagNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => Promise<void>;
  /** 現在のノート */
  currentNote: string;
}

/**
 * タグノート編集ダイアログ
 *
 * Googleスタイルのシンプルなダイアログ
 * - Textarea（改行不可、折り返し表示）
 * - 文字数カウント
 * - キャンセル/OKボタン
 * - Esc でキャンセル
 */
export function TagNoteDialog({ isOpen, onClose, onSave, currentNote }: TagNoteDialogProps) {
  const t = useTranslations();
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // モーダルが開いたら現在のノートをセット
  useEffect(() => {
    if (isOpen) {
      setNote(currentNote);
    }
  }, [isOpen, currentNote]);

  // ESCキーでダイアログを閉じる
  useDialogKeyboard(isOpen, isLoading, onClose);

  const handleSubmit = useCallback(async () => {
    const trimmedNote = note.trim();

    // 変更がない場合は閉じるだけ
    if (trimmedNote === currentNote) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(trimmedNote);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [note, currentNote, onSave, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 改行を除去して1行のみ許可
    const newValue = e.target.value.replace(/[\r\n]/g, '');
    if (newValue.length <= MAX_LENGTH) {
      setNote(newValue);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterキーを無効化（改行を防ぐ）
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  if (!isOpen) return null;

  const dialog = (
    <div
      className="bg-card fixed inset-0 z-[250] flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-note-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-2xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 360px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 id="tag-note-dialog-title" className="mb-4 text-base font-bold">
          {t('calendar.filter.editNote')}
        </h2>

        {/* Textarea */}
        <Field className="mb-6">
          <Textarea
            id="tag-note-input"
            value={note}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t('calendar.filter.notePlaceholder')}
            maxLength={MAX_LENGTH}
            className="border-border min-h-[80px] w-full resize-none border text-sm"
            autoFocus
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="min-h-5 flex-1">
              {note.length >= MAX_LENGTH && (
                <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
              )}
            </div>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {note.length}/{MAX_LENGTH}
            </span>
          </div>
        </Field>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '...' : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
