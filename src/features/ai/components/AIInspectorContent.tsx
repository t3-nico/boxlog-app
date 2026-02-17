'use client';

import { KeyRound } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

import { useAIChat } from '../hooks/useAIChat';

import { ChatEmptyState } from './ChatEmptyState';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';

const SUGGESTIONS = ['今日の予定は？', 'タグを整理したい', '統計を教えて'];

/**
 * AI チャットコンテンツ
 *
 * サイドパネル内に表示されるチャットインターフェース
 * - Vercel AI SDK (useChat) によるストリーミング
 * - BYOK: APIキーをSettings > Integrationsで管理
 */
export const AIInspectorContent = memo(function AIInspectorContent() {
  const { messages, input, setInput, handleSubmit, isLoading, stop, hasApiKey, keyLoaded, error } =
    useAIChat();

  const openSettings = useSettingsModalStore((s) => s.openModal);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
    },
    [setInput],
  );

  const handleOpenIntegrations = useCallback(() => {
    openSettings('integrations');
  }, [openSettings]);

  // キー読み込み中
  if (!keyLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  // APIキー未設定
  if (!hasApiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="bg-surface-container rounded-full p-3">
          <KeyRound className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">API Key Required</p>
          <p className="text-muted-foreground text-xs">
            Set up your AI API key in Settings to start chatting.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenIntegrations}>
          Open Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* エラー表示 */}
      {error && (
        <div className="bg-destructive/10 text-destructive shrink-0 px-4 py-2 text-xs">
          {error.message}
        </div>
      )}

      {/* メッセージ or 空状態 */}
      <div className="min-h-0 flex-1">
        {messages.length > 0 ? (
          <ChatMessageList messages={messages} />
        ) : (
          <ChatEmptyState suggestions={SUGGESTIONS} onSuggestionClick={handleSuggestionClick} />
        )}
      </div>

      {/* 入力 */}
      <ChatInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
      />
    </div>
  );
});
