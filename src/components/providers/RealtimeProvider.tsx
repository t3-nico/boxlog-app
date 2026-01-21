/**
 * Realtime購読を一元管理するProvider
 *
 * @description
 * アプリケーション全体でSupabase Realtimeの購読を一元管理。
 * 各機能のRealtime購読をここで有効化することで、
 * 重複購読を防ぎ、接続数を最適化する。
 *
 * アーキテクチャ:
 * 1. AuthStoreから認証済みユーザーIDを取得
 * 2. ユーザーIDが存在する場合のみ購読を有効化
 * 3. 各機能のRealtime購読フックを呼び出し
 *
 * 注意:
 * このProviderは認証必須ページ専用。
 * 公開ページでは使用しないこと（PublicProvidersを使用）。
 *
 * @see /CLAUDE.md - プロバイダー階層の詳細
 * @see src/components/providers/PublicProviders.tsx - 公開ページ用
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useCalendarRealtime } from '@/features/calendar/hooks/useCalendarRealtime';
import { useNotificationRealtime } from '@/features/notifications/hooks/useNotificationRealtime';
import { usePlanRealtime } from '@/features/plans/hooks/usePlanRealtime';
import { useTagRealtime } from '@/features/tags/hooks/useTagRealtime';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

/**
 * Realtime購読Provider
 *
 * プロバイダー階層での位置:
 * QueryClientProvider → tRPC Provider → AuthStoreInitializer → RealtimeProvider
 *
 * 理由: AuthStoreが初期化された後に購読を開始する必要があるため
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const loading = useAuthStore((state) => state.loading);
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  // クライアントサイドマウント確認（SSR時のtRPCコンテキストエラー回避）
  const [isMounted, setIsMounted] = useState(false);

  // クライアントマウント時にフラグを設定
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // AuthStoreの初期化を待つ
  useEffect(() => {
    // loadingがfalseになるまで待つ（AuthStoreの初期化完了を待つ）
    if (loading) {
      return;
    }

    // AuthStoreのloading完了 = 初期化完了なので、即座にreadyにする
    setIsReady(true);
  }, [userId, loading]);

  // 購読を有効化する条件
  // - クライアントサイドでマウントされている
  // - 初期化が完了している
  // - ユーザーIDが存在する
  const shouldSubscribe = isMounted && isReady && !!userId;

  // ページ別購読設定（パフォーマンス最適化）
  // 各ページで必要な購読のみを有効化してWebSocket接続数を削減
  const subscriptionConfig = useMemo(() => {
    // pathnameがnullの場合（SSR時など）は全て無効
    if (!pathname) {
      return {
        calendar: false,
        inbox: false,
        tags: false,
        notifications: false,
      };
    }

    // localeを除去してパスを正規化
    const normalizedPath = pathname.replace(/^\/(ja|en)/, '');

    return {
      // カレンダーページ: カレンダーとプランの購読が必要
      calendar: normalizedPath.startsWith('/calendar'),
      // Inboxページ: プランの購読が必要
      inbox: normalizedPath.startsWith('/inbox'),
      // タグページ / カレンダー: タグの購読が必要
      tags: normalizedPath.startsWith('/tags') || normalizedPath.startsWith('/calendar'),
      // 通知は全ページで必要
      notifications: true,
    };
  }, [pathname]);

  // 各機能のRealtime購読（ページ別に条件付き有効化）
  // フックは常に呼び出されるが、enabled=falseの場合は購読しない
  useCalendarRealtime(userId, {
    enabled: shouldSubscribe && subscriptionConfig.calendar,
  });
  usePlanRealtime(userId, {
    enabled: shouldSubscribe && (subscriptionConfig.calendar || subscriptionConfig.inbox),
  });
  useTagRealtime(userId, {
    enabled: shouldSubscribe && subscriptionConfig.tags,
  });
  useNotificationRealtime(userId, shouldSubscribe && subscriptionConfig.notifications);

  return <>{children}</>;
}
