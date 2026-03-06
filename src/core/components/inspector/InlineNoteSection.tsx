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

import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

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
  icon?: LucideIcon;
  note: string;
  onNoteChange: (text: string) => void;
  placeholder?: string | undefined;
  disabled?: boolean;
  maxLength?: number;
}

export function InlineNoteSection({
  label,
  icon: Icon,
  note,
  onNoteChange,
  placeholder,
  disabled = false,
  maxLength = 1000,
}: InlineNoteSectionProps) {
  const displayNote = useMemo(() => stripHtml(note), [note]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-muted-foreground size-4 flex-shrink-0" />}
          <span className="text-muted-foreground text-sm">{label}</span>
        </div>
        <span className="text-muted-foreground px-2 text-xs tabular-nums">
          {displayNote.length}/{maxLength}
        </span>
      </div>
      <input
        type="text"
        value={displayNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="bg-input text-foreground placeholder:text-muted-foreground surface-sunken focus-visible:ring-ring mr-2 h-8 rounded-lg border border-transparent px-4 text-sm outline-none focus-visible:ring-2"
      />
    </div>
  );
}
