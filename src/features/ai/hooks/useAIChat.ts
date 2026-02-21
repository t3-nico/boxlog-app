'use client';

/**
 * useAIChat Hook（オーケストレーション）
 *
 * 責務を2つのサブフックに分割:
 * - useAIChatApiKey: APIキー読み込み、プロバイダー選択、transport作成
 * - useAIChatConversation: 会話永続化（DB保存・読み込み・削除・リセット）
 */

import { useChat } from '@ai-sdk/react';
import { useCallback, useMemo, useState } from 'react';

import { api } from '@/lib/trpc';

import { useChatStore } from '../stores/useChatStore';
import { useAIChatApiKey } from './useAIChatApiKey';
import { useAIChatConversation } from './useAIChatConversation';

export function useAIChat() {
  const [input, setInput] = useState('');

  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useChatStore((s) => s.setSelectedModelId);
  const utils = api.useUtils();

  // --- サブフック: APIキー・プロバイダー ---
  const {
    providerId,
    keyLoaded,
    hasApiKey,
    isFreeTier,
    availableModels,
    transportRef,
    userId,
  } = useAIChatApiKey();

  // 無料枠の利用状況
  const usageQuery = api.chat.getUsage.useQuery(undefined, {
    enabled: keyLoaded && !!userId && isFreeTier,
    staleTime: 10_000,
  });

  const freeTierUsage = isFreeTier ? (usageQuery.data ?? null) : null;
  const freeTierExhausted = freeTierUsage !== null && freeTierUsage.used >= freeTierUsage.limit;
  const canSend = hasApiKey || (isFreeTier && !freeTierExhausted);

  // useChat hook（AI SDK v6）
  const {
    messages,
    sendMessage: chatSendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    transport: transportRef.current!,
    onFinish: ({ messages: finishedMessages, isError, isAbort }) => {
      if (isError || isAbort) return;
      saveMessages(finishedMessages);
      if (isFreeTier) {
        utils.chat.getUsage.invalidate();
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // --- サブフック: 会話永続化 ---
  const {
    activeConversationId,
    isSaving,
    conversations,
    saveMessages,
    loadConversation: loadConversationRaw,
    deleteConversation,
    reset,
  } = useAIChatConversation({
    keyLoaded,
    userId,
    setMessages,
  });

  // loadConversation にisLoadingガードを追加
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (isLoading) return;
      await loadConversationRaw(conversationId);
    },
    [isLoading, loadConversationRaw],
  );

  // テキストでメッセージ送信
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !canSend || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [canSend, isLoading, chatSendMessage],
  );

  // フォーム送信ハンドラ
  const handleSubmit = useCallback(() => {
    if (!input.trim() || !canSend || isLoading) return;
    chatSendMessage({ text: input.trim() });
    setInput('');
  }, [input, canSend, isLoading, chatSendMessage]);

  // サジェスチョンクリック時
  const submitText = useCallback(
    (text: string) => {
      if (!text.trim() || !canSend || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [canSend, isLoading, chatSendMessage],
  );

  // リトライ
  const retry = useCallback(() => {
    if (isLoading || messages.length === 0) return;

    const trimmed = [...messages];
    while (trimmed.length > 0 && trimmed.at(-1)?.role === 'assistant') {
      trimmed.pop();
    }

    const lastUserMessage = trimmed[trimmed.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    const textPart = lastUserMessage.parts.find((p) => p.type === 'text');
    if (!textPart || textPart.type !== 'text') return;

    setMessages(trimmed.slice(0, -1));
    chatSendMessage({ text: textPart.text });
  }, [messages, isLoading, setMessages, chatSendMessage]);

  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      handleSubmit,
      sendMessage,
      submitText,
      isLoading,
      stop,
      error: error ?? null,
      hasApiKey,
      isFreeTier,
      freeTierUsage,
      freeTierExhausted,
      keyLoaded,
      providerId,
      reset,
      retry,
      isSaving,
      activeConversationId,
      conversations,
      loadConversation,
      deleteConversation,
      selectedModelId,
      setSelectedModelId,
      availableModels,
    }),
    [
      messages,
      input,
      setInput,
      handleSubmit,
      sendMessage,
      submitText,
      isLoading,
      stop,
      error,
      hasApiKey,
      isFreeTier,
      freeTierUsage,
      freeTierExhausted,
      keyLoaded,
      providerId,
      reset,
      retry,
      isSaving,
      activeConversationId,
      conversations,
      loadConversation,
      deleteConversation,
      selectedModelId,
      setSelectedModelId,
      availableModels,
    ],
  );
}
