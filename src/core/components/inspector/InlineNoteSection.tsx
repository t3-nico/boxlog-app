'use client';

/**
 * インラインメモ行
 *
 * DateNavigatorRow / TimeRow と同じ「ラベル + コンテンツ」形式。
 * プレーンテキスト textarea をインライン表示。
 *
 * 既存データが HTML 形式の場合は自動的にタグを除去して表示。
 * 保存はプレーンテキストで行う。
 */

import { useMemo } from 'react';

import { cn } from '@/lib/utils';

/** HTML タグを除去してプレーンテキストに変換 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

interface InlineNoteSectionProps {
  label: string;
  note: string;
  onNoteChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineNoteSection({
  label,
  note,
  onNoteChange,
  placeholder,
  disabled = false,
}: InlineNoteSectionProps) {
  const displayNote = useMemo(() => stripHtml(note), [note]);

  return (
    <div className="flex items-start gap-1">
      <span className="text-muted-foreground w-12 flex-shrink-0 pt-1 text-sm">{label}</span>
      <textarea
        value={displayNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'text-foreground placeholder:text-muted-foreground w-full resize-none bg-transparent text-sm outline-none',
          'max-h-32 min-h-7 overflow-y-auto',
        )}
      />
    </div>
  );
}
