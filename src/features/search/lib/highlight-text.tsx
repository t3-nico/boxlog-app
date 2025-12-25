import { Fragment } from 'react';

import type { FuseMatch } from './search-engine';

/**
 * 検索語句をハイライトするためのユーティリティ
 */

interface HighlightMatch {
  start: number;
  end: number;
}

/**
 * テキスト内の検索語句のマッチ位置を取得（シンプルな文字列検索）
 */
export function findMatches(text: string, query: string): HighlightMatch[] {
  if (!query.trim() || !text) return [];

  const matches: HighlightMatch[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let startIndex = 0;
  while (true) {
    const index = lowerText.indexOf(lowerQuery, startIndex);
    if (index === -1) break;
    matches.push({ start: index, end: index + query.length });
    startIndex = index + 1;
  }

  return matches;
}

/**
 * Fuse.jsのマッチ情報をHighlightMatch形式に変換
 */
export function convertFuseMatches(
  fuseMatches: FuseMatch[] | undefined,
  key: string,
): HighlightMatch[] {
  if (!fuseMatches) return [];

  const keyMatch = fuseMatches.find((m) => m.key === key);
  if (!keyMatch) return [];

  return keyMatch.indices.map(([start, end]) => ({
    start,
    end: end + 1, // Fuse.js indices are inclusive, we need exclusive end
  }));
}

/**
 * マッチ範囲をマージして重複を排除
 */
function mergeMatches(matches: HighlightMatch[]): HighlightMatch[] {
  if (matches.length === 0) return [];

  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const firstMatch = sorted[0];
  if (!firstMatch) return [];

  const merged: HighlightMatch[] = [firstMatch];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (!current || !last) continue;

    if (current.start <= last.end) {
      // Overlapping - extend the last match
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

interface HighlightedTextProps {
  text: string;
  query: string;
  fuseMatches?: FuseMatch[];
  fuseKey?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * 検索語句をハイライトしたReact要素を返す
 *
 * @param text - 表示するテキスト
 * @param query - 検索クエリ（Fuse.jsマッチがない場合のフォールバック用）
 * @param fuseMatches - Fuse.jsのマッチ情報（あれば優先使用）
 * @param fuseKey - Fuse.jsマッチのキー（title, description等）
 */
export function HighlightedText({
  text,
  query,
  fuseMatches,
  fuseKey,
  className,
  highlightClassName = 'bg-primary/20 text-foreground rounded-sm',
}: HighlightedTextProps) {
  if (!text) {
    return <span className={className}>{text}</span>;
  }

  // Get matches - prefer Fuse.js matches if available
  let matches: HighlightMatch[];

  if (fuseMatches && fuseKey) {
    matches = convertFuseMatches(fuseMatches, fuseKey);
  } else if (query.trim()) {
    matches = findMatches(text, query);
  } else {
    return <span className={className}>{text}</span>;
  }

  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Merge overlapping matches
  const mergedMatches = mergeMatches(matches);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  mergedMatches.forEach((match, i) => {
    // Ensure we don't exceed text length
    const start = Math.min(match.start, text.length);
    const end = Math.min(match.end, text.length);

    // マッチ前のテキスト
    if (start > lastIndex) {
      parts.push(<Fragment key={`text-${i}`}>{text.slice(lastIndex, start)}</Fragment>);
    }

    // ハイライト部分
    if (end > start) {
      parts.push(
        <mark key={`match-${i}`} className={highlightClassName}>
          {text.slice(start, end)}
        </mark>,
      );
    }

    lastIndex = end;
  });

  // 最後のマッチ後のテキスト
  if (lastIndex < text.length) {
    parts.push(<Fragment key="text-end">{text.slice(lastIndex)}</Fragment>);
  }

  return <span className={className}>{parts}</span>;
}
