import type { PlanStatus } from '@/features/plans/types';

import type { SearchFilters } from '../types';

export interface ParsedQuery {
  text: string;
  filters: SearchFilters;
  hasFilters: boolean;
}

/**
 * クイックフィルター構文のパターン
 * - #tagname: タグでフィルター
 * - status:done, status:in_progress, status:todo: ステータスでフィルター
 * - due:today, due:tomorrow, due:overdue: 期限でフィルター
 */
const FILTER_PATTERNS = {
  tag: /#(\S+)/g,
  status: /status:(\w+)/gi,
  due: /due:(\w+)/gi,
};

const STATUS_MAP: Record<string, PlanStatus> = {
  done: 'closed',
  completed: 'closed',
  complete: 'closed',
  open: 'open',
  todo: 'open', // 後方互換: 旧構文対応
  pending: 'open',
  in_progress: 'open', // 後方互換: 旧構文対応
  inprogress: 'open',
  doing: 'open', // 後方互換: 旧構文対応
};

const DUE_MAP: Record<string, SearchFilters['dueDate']> = {
  today: 'today',
  tomorrow: 'tomorrow',
  week: 'this_week',
  this_week: 'this_week',
  overdue: 'overdue',
  no_due: 'no_due_date',
  none: 'no_due_date',
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

  // ステータスフィルター抽出
  const statusMatches = query.matchAll(FILTER_PATTERNS.status);
  const statuses: PlanStatus[] = [];
  for (const match of statusMatches) {
    if (match[1]) {
      const statusKey = match[1].toLowerCase();
      const mappedStatus = STATUS_MAP[statusKey];
      if (mappedStatus) {
        statuses.push(mappedStatus);
      }
    }
    text = text.replace(match[0], '');
  }
  if (statuses.length > 0) {
    filters.status = statuses;
  }

  // 期限フィルター抽出
  const dueMatches = query.matchAll(FILTER_PATTERNS.due);
  for (const match of dueMatches) {
    if (match[1]) {
      const dueKey = match[1].toLowerCase();
      const mappedDue = DUE_MAP[dueKey];
      if (mappedDue) {
        filters.dueDate = mappedDue;
      }
    }
    text = text.replace(match[0], '');
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
  return [
    { syntax: '#タグ名', description: 'タグでフィルター' },
    { syntax: 'status:open', description: '未完了を表示' },
    { syntax: 'status:done', description: '完了済みを表示' },
    { syntax: 'due:today', description: '今日が期限' },
    { syntax: 'due:overdue', description: '期限超過' },
  ];
}
