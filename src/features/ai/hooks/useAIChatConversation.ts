'use client';

/**
 * AIチャットの会話永続化（DB保存・読み込み・削除・リセット）
 */

import { useCallback, useEffect, useRef } from 'react';

import type { UIMessage } from 'ai';

import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import { useChatStore } from '../stores/useChatStore';

interface UseAIChatConversationProps {
  keyLoaded: boolean;
  userId: string | undefined;
  setMessages: (messages: UIMessage[]) => void;
}

export function useAIChatConversation({
  keyLoaded,
  userId,
  setMessages,
}: UseAIChatConversationProps) {
  const utils = api.useUtils();

  // Zustand store
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const initialized = useChatStore((s) => s.initialized);
  const isSaving = useChatStore((s) => s.isSaving);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const setInitialized = useChatStore((s) => s.setInitialized);
  const setIsSaving = useChatStore((s) => s.setIsSaving);
  const resetConversation = useChatStore((s) => s.resetConversation);

  // tRPC mutations
  const conversationsQuery = api.chat.list.useQuery(undefined, {
    enabled: keyLoaded && !!userId,
    staleTime: 30_000,
  });
  const createConversation = api.chat.create.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const saveConversation = api.chat.save.useMutation();
  const deleteConversationMutation = api.chat.delete.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });

  // 保存中の競合を防ぐためのガード
  const savingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = activeConversationId;

  // DB永続化: 保存関数
  const saveMessages = useCallback(
    async (messages: UIMessage[]) => {
      if (savingRef.current || messages.length === 0) return;

      savingRef.current = true;
      setIsSaving(true);

      try {
        const currentId = conversationIdRef.current;

        if (currentId) {
          await saveConversation.mutateAsync({
            conversationId: currentId,
            messages: messages.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant' | 'system',
              parts: m.parts as Array<{ type: string; [key: string]: unknown }>,
            })),
          });
        } else {
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

  // DB永続化: マウント時に最新会話を復元
  const { data: mostRecentConversation } = api.chat.getMostRecent.useQuery(undefined, {
    enabled: keyLoaded && !!userId && !initialized,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initialized || !keyLoaded || !userId) return;

    if (mostRecentConversation) {
      setMessages(mostRecentConversation.messages as UIMessage[]);
      setActiveConversationId(mostRecentConversation.id);
    }
    setInitialized(true);
  }, [
    mostRecentConversation,
    initialized,
    keyLoaded,
    userId,
    setMessages,
    setActiveConversationId,
    setInitialized,
  ]);

  // 会話切替（履歴から読み込み）
  const loadConversation = useCallback(
    async (conversationId: string) => {
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
    [utils.chat.getById, setMessages, setActiveConversationId],
  );

  // 会話削除
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversationMutation.mutateAsync({ conversationId });
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

  return {
    activeConversationId,
    isSaving,
    conversations: conversationsQuery.data ?? [],
    saveMessages,
    loadConversation,
    deleteConversation,
    reset,
  };
}
