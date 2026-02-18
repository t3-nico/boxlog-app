'use client';

import { useTranslations } from 'next-intl';

import { Textarea } from '@/components/ui/textarea';

interface ReflectionUserNoteProps {
  /** 現在のメモテキスト */
  value: string;
  /** テキスト変更コールバック */
  onChange: (value: string) => void;
  /** 読み取り専用にするか */
  readOnly?: boolean;
}

/**
 * ユーザーメモ入力欄
 *
 * Reflection（AI日報）にユーザーが自由に追記するテキストエリア
 */
export function ReflectionUserNote({ value, onChange, readOnly }: ReflectionUserNoteProps) {
  const t = useTranslations('calendar.reflection');

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('userNote.placeholder')}
      readOnly={readOnly}
      className="min-h-20 resize-none"
    />
  );
}
