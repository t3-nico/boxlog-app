'use client';

import { Bot, Send } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InspectorHeader } from '@/features/inspector';

import { useAIInspectorStore } from '../stores';

/**
 * AIInspector コンテンツ
 *
 * チャットインターフェースの骨組み
 * - メッセージ表示エリア
 * - 入力フォーム
 */
export const AIInspectorContent = memo(function AIInspectorContent() {
  const closeInspector = useAIInspectorStore((state) => state.closeInspector);
  const displayMode = useAIInspectorStore((state) => state.displayMode);
  const context = useAIInspectorStore((state) => state.context);

  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Stub: AI SDKを使用してメッセージを送信
      setInput('');
    },
    [input],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <InspectorHeader
        onClose={closeInspector}
        displayMode={displayMode}
        closeLabel="AIチャットを閉じる"
      />

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 空状態 */}
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="bg-surface-container flex h-16 w-16 items-center justify-center rounded-full">
            <Bot className="text-primary h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-normal">AIアシスタント</h3>
            <p className="text-muted-foreground max-w-[280px] text-sm">
              質問や操作の依頼をどうぞ。現在のページの情報を元に回答します。
            </p>
            {context && (
              <p className="text-muted-foreground text-xs">
                コンテキスト: {context.pageType}
                {context.itemId && ` / ${context.itemType}: ${context.itemId}`}
              </p>
            )}
          </div>

          {/* サンプルプロンプト */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['今日の予定は？', 'タグを整理したい', '統計を教えて'].map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="border-border border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="min-h-11 resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="送信">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          設定でAPIキーを登録すると利用できます
        </p>
      </div>
    </div>
  );
});
