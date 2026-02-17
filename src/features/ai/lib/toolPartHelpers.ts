/**
 * Tool Part Helpers
 *
 * UIMessage.parts 内のツール呼び出しパートを判定・整形するユーティリティ。
 * Vercel AI SDK v6 では、ツールパートは 'tool-{toolName}' 型で表現される。
 */

import type { UIMessage } from 'ai';

/** UIMessage.parts の1要素の型 */
type UIMessagePart = UIMessage['parts'][number];

/**
 * パートがツール呼び出しかどうか判定
 */
export function isToolPart(part: UIMessagePart): boolean {
  return part.type.startsWith('tool-') || part.type === 'dynamic-tool';
}

/**
 * ツール名を抽出
 */
export function getToolName(part: UIMessagePart): string {
  if (part.type === 'dynamic-tool') {
    return (part as { type: 'dynamic-tool'; toolName: string }).toolName;
  }
  return part.type.replace('tool-', '');
}

/** ツール表示情報 */
interface ToolDisplayInfo {
  label: string;
}

/** ツール名 → 表示ラベル */
const TOOL_LABELS: Record<string, ToolDisplayInfo> = {
  searchPlans: { label: 'Plans' },
  searchRecords: { label: 'Records' },
  getStatistics: { label: 'Statistics' },
  getTagStats: { label: 'Tags' },
};

/**
 * ツール名から表示ラベルを取得
 */
export function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName]?.label ?? toolName;
}

/**
 * ツール結果からサマリーテキストを生成
 */
export function formatToolSummary(toolName: string, output: unknown): string {
  if (!output || typeof output !== 'object') return 'Done';

  const result = output as Record<string, unknown>;

  if ('error' in result) {
    return String(result.error);
  }

  switch (toolName) {
    case 'searchPlans': {
      const count = typeof result.count === 'number' ? result.count : 0;
      return `Found ${count} plan${count !== 1 ? 's' : ''}`;
    }
    case 'searchRecords': {
      const count = typeof result.count === 'number' ? result.count : 0;
      const hours = typeof result.totalHours === 'number' ? result.totalHours : 0;
      return `Found ${count} record${count !== 1 ? 's' : ''} (${hours}h total)`;
    }
    case 'getStatistics': {
      const planned =
        typeof result.plannedHours === 'number' ? `${result.plannedHours}h planned` : '';
      const recorded =
        typeof result.recordedHours === 'number' ? `${result.recordedHours}h recorded` : '';
      const parts = [planned, recorded].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Stats loaded';
    }
    case 'getTagStats': {
      const tags = Array.isArray(result.tags) ? result.tags : [];
      return `${tags.length} tag${tags.length !== 1 ? 's' : ''} analyzed`;
    }
    default:
      return 'Done';
  }
}
