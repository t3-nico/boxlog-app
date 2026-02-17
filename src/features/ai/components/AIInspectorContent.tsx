'use client';

import { KeyRound, Plus, RefreshCw } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

import { useAIChat } from '../hooks/useAIChat';

import { ChatEmptyState } from './ChatEmptyState';
import { ChatHistoryPopover } from './ChatHistoryPopover';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';

const SUGGESTIONS = ['今日の予定は？', 'タグを整理したい', '統計を教えて'];

/**
 * AI チャットコンテンツ
 *
 * サイドパネル内に表示されるチャットインターフェース
 * - Vercel AI SDK (useChat) によるストリーミング
 * - BYOK: APIキーをSettings > Integrationsで管理
 * - DB永続化: 会話はリロード後も復元
 * - 会話履歴: ヘッダーから過去の会話に切替可能
 */
export const AIInspectorContent = memo(function AIInspectorContent() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    hasApiKey,
    keyLoaded,
    error,
    retry,
    reset,
    conversations,
    activeConversationId,
    loadConversation,
  } = useAIChat();

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

  const hasMessages = messages.length > 0;
  const showHeader = hasMessages || conversations.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダーバー: メッセージまたは履歴が存在する時に表示 */}
      {showHeader && (
        <div className="flex shrink-0 items-center justify-end gap-1 px-4 pt-4 pb-2">
          <ChatHistoryPopover
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={loadConversation}
            disabled={isLoading}
          />
          <HoverTooltip content="New conversation">
            <Button
              variant="ghost"
              size="sm"
              icon
              onClick={reset}
              disabled={isLoading}
              aria-label="New conversation"
            >
              <Plus className="size-5" />
            </Button>
          </HoverTooltip>
        </div>
      )}

      {/* エラー表示 + リトライ */}
      {error && (
        <div className="bg-destructive/10 text-destructive flex shrink-0 items-center gap-2 px-4 py-2 text-xs">
          <span className="flex-1">{error.message}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-6 gap-1 px-2 text-xs"
            onClick={retry}
            disabled={isLoading}
          >
            <RefreshCw className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {/* メッセージ or 空状態 */}
      <div className="min-h-0 flex-1">
        {hasMessages ? (
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
