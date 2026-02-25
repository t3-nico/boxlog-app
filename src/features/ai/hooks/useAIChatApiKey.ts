'use client';

/**
 * AIチャット用APIキーの読み込みとプロバイダー選択
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { ApiKeyStorage } from '@/lib/security/encryption';

import type { AIProviderId } from '@/server/services/ai/types';
import { MODEL_OPTIONS } from '@/server/services/ai/types';

import { useChatStore } from '../stores/useChatStore';

/** 優先順位でAPIキーの存在をチェックするプロバイダー順 */
const PROVIDER_PRIORITY: AIProviderId[] = ['anthropic', 'openai'];

export function useAIChatApiKey() {
  const user = useAuthStore((state) => state.user);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<AIProviderId>('anthropic');
  const [keyLoaded, setKeyLoaded] = useState(false);

  const selectedModelId = useChatStore((s) => s.selectedModelId);

  const userId = user?.id;

  // APIキーの遅延読み込み
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadKey() {
      for (const provider of PROVIDER_PRIORITY) {
        if (!ApiKeyStorage.exists(provider)) continue;

        const key = await ApiKeyStorage.load(provider, userId!);
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
  }, [userId]);

  const hasApiKey = apiKey !== null;
  const isFreeTier = !hasApiKey;

  // 現在のプロバイダーで利用可能なモデル一覧
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

  return {
    apiKey,
    providerId,
    keyLoaded,
    hasApiKey,
    isFreeTier,
    availableModels,
    transportRef,
    userId: user?.id,
  };
}
