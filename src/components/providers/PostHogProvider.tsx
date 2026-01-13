/**
 * PostHog Analytics Provider
 *
 * @description
 * PostHogによるプロダクトアナリティクス。
 * ユーザー行動の計測とFirst Value到達率の分析に使用。
 *
 * 計測イベント（最小構成）:
 * - user_signed_up: 登録完了
 * - plan_created: Plan作成
 * - plan_completed: Plan完了（First Value）
 *
 * @see https://posthog.com/docs/libraries/next-js
 */
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

/**
 * PostHog初期化
 * 環境変数が設定されている場合のみ有効化
 */
function initPostHog() {
  if (typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  // 環境変数が未設定の場合はスキップ（開発環境での柔軟性）
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY not set, analytics disabled');
    }
    return;
  }

  // 既に初期化済みの場合はスキップ
  if (posthog.__loaded) return;

  posthog.init(apiKey, {
    api_host: apiHost,
    // App Routerでは手動でページビューを送信
    capture_pageview: false,
    capture_pageleave: true,
    // パフォーマンス最適化
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        // 開発環境ではデバッグモード有効
        posthog.debug();
      }
    },
    // プライバシー設定
    persistence: 'localStorage+cookie',
    // セッションリプレイ（無料枠で使用可能）
    disable_session_recording: process.env.NODE_ENV === 'development',
  });
}

/**
 * ページビュートラッカー
 * Next.js App Routerでのルート変更を検知してページビューを送信
 */
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (!pathname || !posthogClient) return;

    // URLを構築（検索パラメータ含む）
    let url = window.origin + pathname;
    if (searchParams?.toString()) {
      url += `?${searchParams.toString()}`;
    }

    posthogClient.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, posthogClient]);

  return null;
}

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog();
  }, []);

  // PostHogが初期化されていない場合でも子要素をレンダリング
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
