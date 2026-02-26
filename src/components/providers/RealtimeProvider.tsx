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
import { useMemo } from 'react';

import { isCalendarViewPath, useCalendarRealtime } from '@/features/calendar';
import { useNotificationRealtime } from '@/features/notifications';
import { usePlanRealtime } from '@/features/plans';
import { useTagRealtime } from '@/features/tags';
import { useHasMounted } from '@/hooks/useHasMounted';
import { useAuthStore } from '@/stores/useAuthStore';

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
  // クライアントサイドマウント確認（SSR時のtRPCコンテキストエラー回避）
  const isMounted = useHasMounted();

  // 購読を有効化する条件
  // - クライアントサイドでマウントされている
  // - AuthStoreの初期化が完了している（loading === false）
  // - ユーザーIDが存在する
  const shouldSubscribe = isMounted && !loading && !!userId;

  // ページ別購読設定（パフォーマンス最適化）
  // 各ページで必要な購読のみを有効化してWebSocket接続数を削減
  const subscriptionConfig = useMemo(() => {
    // pathnameがnullの場合（SSR時など）は全て無効
    if (!pathname) {
      return {
        calendar: false,
        plan: false,
        tags: false,
        notifications: false,
      };
    }

    // localeを除去してパスを正規化
    const normalizedPath = pathname.replace(/^\/(ja|en)/, '');

    const isCalendarPage = isCalendarViewPath(normalizedPath);

    return {
      // カレンダーページ: カレンダーとプランの購読が必要
      calendar: isCalendarPage,
      // プランはカレンダーのアサイドで表示されるため、カレンダーページで購読
      plan: isCalendarPage,
      // タグはサイドバーに常時表示されるため、カレンダーページで購読
      tags: isCalendarPage,
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
    enabled: shouldSubscribe && (subscriptionConfig.calendar || subscriptionConfig.plan),
  });
  useTagRealtime(userId, {
    enabled: shouldSubscribe && subscriptionConfig.tags,
  });
  useNotificationRealtime(userId, shouldSubscribe && subscriptionConfig.notifications);

  return <>{children}</>;
}
