import type { SearchFilters } from '../types';

export interface ParsedQuery {
  text: string;
  filters: SearchFilters;
  hasFilters: boolean;
}

/**
 * クイックフィルター構文のパターン
 * - #tagname: タグでフィルター
 */
const FILTER_PATTERNS = {
  tag: /#(\S+)/g,
};

/**
 * 検索クエリを解析してテキストとフィルターを分離
 */
export function parseSearchQuery(query: string): ParsedQuery {
  let text = query;
  const filters: SearchFilters = {};

  // タグフィルター抽出
  const tagMatches = query.matchAll(FILTER_PATTERNS.tag);
  const tags: string[] = [];
  for (const match of tagMatches) {
    if (match[1]) {
      tags.push(match[1]);
    }
    text = text.replace(match[0], '');
  }
  if (tags.length > 0) {
    filters.tags = tags;
  }

  return {
    text: text.trim(),
    filters,
    hasFilters: Object.keys(filters).length > 0,
  };
}

/**
 * フィルターのヒントテキストを生成
 */
export function getFilterHints(): Array<{ syntax: string; description: string }> {
  return [{ syntax: '#タグ名', description: 'タグでフィルター' }];
}
