'use client';

import { useTranslations } from 'next-intl';

import { Field, FieldError, FieldLabel, FieldSupportText } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 100;

interface TagNoteFieldProps {
  /** ユニークなID（アクセシビリティ用） */
  id: string;
  /** 現在の値 */
  value: string;
  /** 値変更時のコールバック */
  onChange: (value: string) => void;
  /** blur時のコールバック（自動保存用、オプション） */
  onBlur?: () => void;
  /** Textareaのref（オプション） */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * タグノート入力フィールド（1行のみ、折り返し表示）
 *
 * タグ作成モーダルとコンテキストメニューで共通使用
 */
export function TagNoteField({ id, value, onChange, onBlur, textareaRef }: TagNoteFieldProps) {
  const t = useTranslations();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{t('calendar.filter.noteLabel')}</FieldLabel>
      <div className="flex items-center justify-between">
        <FieldSupportText id={`${id}-support`}>{t('calendar.filter.noteHint')}</FieldSupportText>
        <span className="text-muted-foreground text-xs tabular-nums">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
      <Textarea
        id={id}
        ref={textareaRef}
        value={value}
        placeholder={t('calendar.filter.notePlaceholder')}
        onChange={(e) => {
          // 改行を除去して1行のみ許可
          const newValue = e.target.value.replace(/[\r\n]/g, '');
          if (newValue.length <= MAX_LENGTH) {
            onChange(newValue);
          }
        }}
        onKeyDown={(e) => {
          // Enterキーを無効化（改行を防ぐ）+ DropdownMenuへの伝播を停止
          if (e.key === 'Enter') {
            e.preventDefault();
          }
          e.stopPropagation();
        }}
        onBlur={onBlur}
        maxLength={MAX_LENGTH}
        aria-describedby={`${id}-support`}
        className="border-border min-h-[60px] w-full resize-none border text-sm"
      />
      {value.length >= MAX_LENGTH && (
        <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
      )}
    </Field>
  );
}
