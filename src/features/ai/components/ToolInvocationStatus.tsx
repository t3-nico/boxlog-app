'use client';

/**
 * ToolInvocationStatus - AIツール呼び出しのステータス表示
 *
 * チャットメッセージ内にインラインで表示されるコンパクトなステータスインジケーター。
 * ローディング → 成功/エラー の状態遷移を表示。
 */

import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { memo } from 'react';

import type { UIMessage } from 'ai';

import { formatToolSummary, getToolLabel, getToolName } from '../lib/toolPartHelpers';

/** UIMessage.parts の1要素の型 */
type UIMessagePart = UIMessage['parts'][number];

interface ToolInvocationStatusProps {
  part: UIMessagePart;
}

export const ToolInvocationStatus = memo(function ToolInvocationStatus({
  part,
}: ToolInvocationStatusProps) {
  const toolName = getToolName(part);
  const label = getToolLabel(toolName);

  // state はツールパートの共通プロパティ
  const state = 'state' in part ? (part.state as string) : 'input-available';
  const isLoading = state === 'input-streaming' || state === 'input-available';
  const isSuccess = state === 'output-available';
  const isError = state === 'output-error';

  // 出力サマリー
  const summary = isSuccess && 'output' in part ? formatToolSummary(toolName, part.output) : null;

  return (
    <div className="border-border bg-surface-container my-1 flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
      {isLoading && <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />}
      {isSuccess && <CheckCircle className="text-success h-3.5 w-3.5" />}
      {isError && <XCircle className="text-destructive h-3.5 w-3.5" />}

      <span className="text-muted-foreground">
        {isLoading && `Searching ${label}...`}
        {isSuccess && (summary ?? `${label} loaded`)}
        {isError && `${label} failed`}
      </span>
    </div>
  );
});
