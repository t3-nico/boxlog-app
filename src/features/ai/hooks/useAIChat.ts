'use client';

/**
 * useAIChat Hook
 *
 * Vercel AI SDK v6 の useChat をラップし、BYOK（Bring Your Own Key）パターンを統合。
 * APIキーの読み込み、プロバイダー選択、ストリーミング状態管理を提供。
 */

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { UIMessage } from 'ai';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { ApiKeyStorage } from '@/lib/security/encryption';

import type { AIProviderId } from '@/server/services/ai/types';

/** 優先順位でAPIキーの存在をチェックするプロバイダー順 */
const PROVIDER_PRIORITY: AIProviderId[] = ['anthropic', 'openai'];

export function useAIChat() {
  const user = useAuthStore((state) => state.user);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<AIProviderId>('anthropic');
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [input, setInput] = useState('');

  // APIキーの遅延読み込み
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadKey() {
      for (const provider of PROVIDER_PRIORITY) {
        if (!ApiKeyStorage.exists(provider)) continue;

        const key = await ApiKeyStorage.load(provider, user!.id);
        if (key && !cancelled) {
          setApiKey(key);
          setProviderId(provider);
          setKeyLoaded(true);
          return;
        }
      }

      // どのプロバイダーにもキーがない
      if (!cancelled) {
        setKeyLoaded(true);
      }
    }

    loadKey();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const hasApiKey = apiKey !== null;

  // transport をメモ化（apiKey/providerId が変わった時だけ再作成）
  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  const transportKeyRef = useRef<string>('');
  const currentTransportKey = `${apiKey ?? ''}_${providerId}`;

  if (currentTransportKey !== transportKeyRef.current) {
    transportKeyRef.current = currentTransportKey;
    transportRef.current = apiKey
      ? new DefaultChatTransport<UIMessage>({
          api: '/api/chat',
          headers: {
            'x-ai-api-key': apiKey,
          },
          body: {
            providerId,
          },
        })
      : new DefaultChatTransport<UIMessage>({
          api: '/api/chat',
          body: {
            providerId,
          },
        });
  }

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
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // テキストでメッセージ送信
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !hasApiKey || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [hasApiKey, isLoading, chatSendMessage],
  );

  // フォーム送信ハンドラ（入力値をsubmit → クリア）
  const handleSubmit = useCallback(() => {
    if (!input.trim() || !hasApiKey || isLoading) return;
    chatSendMessage({ text: input.trim() });
    setInput('');
  }, [input, hasApiKey, isLoading, chatSendMessage]);

  // サジェスチョンクリック時（入力値を設定してすぐ送信）
  const submitText = useCallback(
    (text: string) => {
      if (!text.trim() || !hasApiKey || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [hasApiKey, isLoading, chatSendMessage],
  );

  // 会話リセット
  const reset = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return useMemo(
    () => ({
      /** メッセージ一覧（UIMessage[]） */
      messages,
      /** 入力値 */
      input,
      /** 入力値を設定 */
      setInput,
      /** フォーム送信（入力値をsubmit→クリア） */
      handleSubmit,
      /** テキストでメッセージ送信 */
      sendMessage,
      /** テキストを即時送信 */
      submitText,
      /** ストリーミング中 */
      isLoading,
      /** ストリーミング停止 */
      stop,
      /** エラー */
      error: error ?? null,
      /** APIキーが設定済み */
      hasApiKey,
      /** キー読み込み完了 */
      keyLoaded,
      /** 現在のプロバイダー */
      providerId,
      /** 会話リセット */
      reset,
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
      keyLoaded,
      providerId,
      reset,
    ],
  );
}
