'use client';

import { memo, useCallback, useState } from 'react';

import type { ChatMessage } from '../types';

import { ChatEmptyState } from './ChatEmptyState';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';

const SUGGESTIONS = ['今日の予定は？', 'タグを整理したい', '統計を教えて'];

/**
 * AI チャットコンテンツ
 *
 * サイドパネル内に表示されるチャットインターフェース
 * - prompt-kit ベースのモジュラー構成
 * - ChatEmptyState: サジェスチョンボタン
 * - ChatInput: 入力フォーム（PromptInput）
 * - ChatMessageList: メッセージ一覧（ChatContainer）
 */
export const AIInspectorContent = memo(function AIInspectorContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, role: 'user', content: input, createdAt: new Date() }]);
    setInput('');
    // Stub: AI SDK連携は後日
  }, [input]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {messages.length > 0 ? (
          <ChatMessageList messages={messages} />
        ) : (
          <ChatEmptyState suggestions={SUGGESTIONS} onSuggestionClick={handleSuggestionClick} />
        )}
      </div>
      <ChatInput value={input} onValueChange={setInput} onSubmit={handleSubmit} />
    </div>
  );
});
