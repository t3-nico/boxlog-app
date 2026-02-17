'use client';

/**
 * useAIChat Hook
 *
 * Vercel AI SDK v6 の useChat をラップし、ハイブリッドAIパターンを統合。
 * - BYOK（Bring Your Own Key）: ユーザーキーで制限なし
 * - 無料枠: サーバーキーで月30回まで（Haiku 4.5固定）
 *
 * APIキーの読み込み、プロバイダー選択、ストリーミング状態管理、会話永続化を提供。
 */

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { UIMessage } from 'ai';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { logger } from '@/lib/logger';
import { ApiKeyStorage } from '@/lib/security/encryption';
import { api } from '@/lib/trpc';

import type { AIProviderId, FreeTierUsage } from '@/server/services/ai/types';
import { MODEL_OPTIONS } from '@/server/services/ai/types';

import { useChatStore } from '../stores/useChatStore';

/** 優先順位でAPIキーの存在をチェックするプロバイダー順 */
const PROVIDER_PRIORITY: AIProviderId[] = ['anthropic', 'openai'];

export function useAIChat() {
  const user = useAuthStore((state) => state.user);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<AIProviderId>('anthropic');
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [input, setInput] = useState('');

  // Zustand store
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const initialized = useChatStore((s) => s.initialized);
  const isSaving = useChatStore((s) => s.isSaving);
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const setInitialized = useChatStore((s) => s.setInitialized);
  const setIsSaving = useChatStore((s) => s.setIsSaving);
  const setSelectedModelId = useChatStore((s) => s.setSelectedModelId);
  const resetConversation = useChatStore((s) => s.resetConversation);

  // --- tRPC queries & mutations ---
  const utils = api.useUtils();
  const conversationsQuery = api.chat.list.useQuery(undefined, {
    enabled: keyLoaded && !!user?.id,
    staleTime: 30_000,
  });
  const createConversation = api.chat.create.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const saveConversation = api.chat.save.useMutation();
  const deleteConversationMutation = api.chat.delete.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });

  // 無料枠の利用状況
  const hasApiKey = apiKey !== null;
  const isFreeTier = !hasApiKey;

  const usageQuery = api.chat.getUsage.useQuery(undefined, {
    enabled: keyLoaded && !!user?.id && isFreeTier,
    staleTime: 10_000,
  });

  const freeTierUsage: FreeTierUsage | null = isFreeTier ? (usageQuery.data ?? null) : null;
  const freeTierExhausted = freeTierUsage !== null && freeTierUsage.used >= freeTierUsage.limit;

  // チャット送信可能か（BYOK or 無料枠で残りあり）
  const canSend = hasApiKey || (isFreeTier && !freeTierExhausted);

  // 保存中の競合を防ぐためのガード
  const savingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = activeConversationId;

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

  // 現在のプロバイダーで利用可能なモデル一覧（無料枠ではModelSelector非表示なので空配列）
  const availableModels = useMemo(
    () => (isFreeTier ? [] : MODEL_OPTIONS.filter((m) => m.providerId === providerId)),
    [providerId, isFreeTier],
  );

  // transport をメモ化（apiKey/providerId/model が変わった時だけ再作成）
  const transportRef = useRef<DefaultChatTransport<UIMessage> | null>(null);
  const transportKeyRef = useRef<string>('');
  const currentTransportKey = `${apiKey ?? 'free'}_${providerId}_${selectedModelId ?? ''}`;

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
            ...(selectedModelId ? { model: selectedModelId } : {}),
          },
        })
      : new DefaultChatTransport<UIMessage>({
          api: '/api/chat',
          body: {
            providerId: 'anthropic',
          },
        });
  }

  // --- DB永続化: 保存関数 ---
  const saveMessages = useCallback(
    async (messages: UIMessage[]) => {
      if (savingRef.current || messages.length === 0) return;

      savingRef.current = true;
      setIsSaving(true);

      try {
        const currentId = conversationIdRef.current;

        if (currentId) {
          // 既存会話を更新
          await saveConversation.mutateAsync({
            conversationId: currentId,
            messages: messages.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant' | 'system',
              parts: m.parts as Array<{ type: string; [key: string]: unknown }>,
            })),
          });
        } else {
          // 新規会話を作成
          const result = await createConversation.mutateAsync({
            messages: messages.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant' | 'system',
              parts: m.parts as Array<{ type: string; [key: string]: unknown }>,
            })),
          });
          if (result) {
            setActiveConversationId(result.id);
          }
        }
      } catch (err) {
        logger.error('Failed to save conversation', { error: err });
      } finally {
        savingRef.current = false;
        setIsSaving(false);
      }
    },
    [saveConversation, createConversation, setActiveConversationId, setIsSaving],
  );

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
      // エラーやキャンセル時は保存しない
      if (isError || isAbort) return;
      saveMessages(finishedMessages);
      // 無料枠の場合、利用量キャッシュを更新
      if (isFreeTier) {
        utils.chat.getUsage.invalidate();
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // --- DB永続化: マウント時に最新会話を復元 ---
  const { data: mostRecentConversation } = api.chat.getMostRecent.useQuery(undefined, {
    enabled: keyLoaded && !!user?.id && !initialized,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initialized || !keyLoaded || !user?.id) return;

    if (mostRecentConversation) {
      setMessages(mostRecentConversation.messages as UIMessage[]);
      setActiveConversationId(mostRecentConversation.id);
    }
    setInitialized(true);
  }, [
    mostRecentConversation,
    initialized,
    keyLoaded,
    user?.id,
    setMessages,
    setActiveConversationId,
    setInitialized,
  ]);

  // テキストでメッセージ送信
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !canSend || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [canSend, isLoading, chatSendMessage],
  );

  // フォーム送信ハンドラ（入力値をsubmit → クリア）
  const handleSubmit = useCallback(() => {
    if (!input.trim() || !canSend || isLoading) return;
    chatSendMessage({ text: input.trim() });
    setInput('');
  }, [input, canSend, isLoading, chatSendMessage]);

  // サジェスチョンクリック時（入力値を設定してすぐ送信）
  const submitText = useCallback(
    (text: string) => {
      if (!text.trim() || !canSend || isLoading) return;
      chatSendMessage({ text: text.trim() });
    },
    [canSend, isLoading, chatSendMessage],
  );

  // リトライ（最後のassistantメッセージを除去して再送信）
  const retry = useCallback(() => {
    if (isLoading || messages.length === 0) return;

    // 末尾からassistantメッセージを除去し、最後のuserメッセージを特定
    const trimmed = [...messages];
    while (trimmed.length > 0 && trimmed.at(-1)?.role === 'assistant') {
      trimmed.pop();
    }

    const lastUserMessage = trimmed[trimmed.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    // テキストパートを抽出
    const textPart = lastUserMessage.parts.find((p) => p.type === 'text');
    if (!textPart || textPart.type !== 'text') return;

    // メッセージを巻き戻して再送信
    setMessages(trimmed.slice(0, -1));
    chatSendMessage({ text: textPart.text });
  }, [messages, isLoading, setMessages, chatSendMessage]);

  // 会話切替（履歴から読み込み）
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (isLoading) return;
      try {
        const conversation = await utils.chat.getById.fetch({ conversationId });
        if (conversation) {
          setMessages(conversation.messages as UIMessage[]);
          setActiveConversationId(conversation.id);
        }
      } catch (err) {
        logger.error('Failed to load conversation', { error: err });
      }
    },
    [isLoading, utils.chat.getById, setMessages, setActiveConversationId],
  );

  // 会話削除
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversationMutation.mutateAsync({ conversationId });
        // アクティブ会話を削除した場合はリセット
        if (conversationIdRef.current === conversationId) {
          setMessages([]);
          resetConversation();
        }
      } catch (err) {
        logger.error('Failed to delete conversation', { error: err });
      }
    },
    [deleteConversationMutation, setMessages, resetConversation],
  );

  // 会話リセット（新規会話開始）
  const reset = useCallback(() => {
    setMessages([]);
    resetConversation();
  }, [setMessages, resetConversation]);

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
      /** APIキーが設定済み（BYOK） */
      hasApiKey,
      /** 無料枠モード（APIキー未設定） */
      isFreeTier,
      /** 無料枠の利用状況（null = BYOK or 未ロード） */
      freeTierUsage,
      /** 無料枠の上限到達 */
      freeTierExhausted,
      /** キー読み込み完了 */
      keyLoaded,
      /** 現在のプロバイダー */
      providerId,
      /** 会話リセット（新規会話開始） */
      reset,
      /** リトライ（最後のメッセージを再送信） */
      retry,
      /** DB保存中 */
      isSaving,
      /** 現在の会話ID */
      activeConversationId,
      /** 会話一覧（サマリー） */
      conversations: conversationsQuery.data ?? [],
      /** 会話切替 */
      loadConversation,
      /** 会話削除 */
      deleteConversation,
      /** 選択中のモデルID */
      selectedModelId,
      /** モデル選択を変更 */
      setSelectedModelId,
      /** 利用可能なモデル一覧（現在のプロバイダー。無料枠では空配列） */
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
      conversationsQuery.data,
      loadConversation,
      deleteConversation,
      selectedModelId,
      setSelectedModelId,
      availableModels,
    ],
  );
}
