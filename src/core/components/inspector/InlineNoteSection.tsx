'use client';

/**
 * インラインメモセクション（プレーンテキスト）
 *
 * Inspector 内にインライン表示される textarea。
 * リッチテキストは不要 — シンプルなプレーンテキストで十分。
 *
 * 既存データが HTML 形式の場合は自動的にタグを除去して表示。
 * 保存はプレーンテキストで行う。
 */

import { useMemo } from 'react';

import { StickyNote } from 'lucide-react';

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
  note: string;
  onNoteChange: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineNoteSection({
  note,
  onNoteChange,
  placeholder,
  disabled = false,
}: InlineNoteSectionProps) {
  const displayNote = useMemo(() => stripHtml(note), [note]);

  return (
    <div className="flex gap-2 px-4 py-2">
      <StickyNote className="text-muted-foreground mt-0.5 size-4 flex-shrink-0" />
      <textarea
        value={displayNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
        className={cn(
          'text-foreground placeholder:text-muted-foreground w-full resize-none bg-transparent text-sm outline-none',
          'max-h-32 min-h-10 overflow-y-auto',
        )}
      />
    </div>
  );
}
