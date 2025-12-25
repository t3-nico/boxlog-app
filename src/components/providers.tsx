/**
 * 認証必須ページ用フルProviders
 *
 * @description
 * 認証が必要なページ（/inbox, /calendar, /tags, /stats等）で使用。
 * tRPC、Realtime購読、GlobalSearch等の全機能を提供する。
 *
 * プロバイダー階層（CLAUDE.md準拠）:
 * 1. QueryClientProvider（データ層）
 * 2. tRPC Provider（API層）
 * 3. AuthStoreInitializer（認証層 - Zustand）
 * 4. RealtimeProvider（リアルタイム購読層 - Supabase）
 * 5. ThemeProvider（UI層）
 * 6. GlobalSearchProvider（機能層）
 * 7. ReactQueryDevtools（開発ツール - 本番環境では自動除外）
 *
 * 公開ページ（/auth/、/legal/、/error/）では、このProvidersではなく
 * 軽量なPublicProvidersを使用すること。
 *
 * @see src/components/providers/PublicProviders.tsx - 公開ページ用軽量Providers
 * @see src/app/[locale]/(app)/layout.tsx - 使用箇所
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';

// React Query DevTools: 本番環境では完全に除外（バンドルサイズ削減）
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
        { ssr: false },
      )
    : () => null;

import { RealtimeProvider } from '@/components/providers/RealtimeProvider';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthStoreInitializer } from '@/features/auth/stores/AuthStoreInitializer';
import { api } from '@/lib/trpc';

// GlobalSearchProviderを遅延ロード（初回レンダリングをブロックしない）
const GlobalSearchProvider = dynamic(
  () => import('@/features/search').then((mod) => mod.GlobalSearchProvider),
  {
    ssr: false,
  },
);

// ServiceWorkerProviderを遅延ロード（PWAオフライン対応）
const ServiceWorkerProvider = dynamic(
  () =>
    import('@/components/providers/ServiceWorkerProvider').then((mod) => mod.ServiceWorkerProvider),
  { ssr: false },
);

// GlobalTagCreateModalを遅延ロード
const GlobalTagCreateModal = dynamic(
  () => import('@/features/tags/components').then((mod) => mod.GlobalTagCreateModal),
  { ssr: false },
);

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // ブラウザではルート相対パス
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // SSR 開発
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分（一般的なデータのデフォルト）
            gcTime: 10 * 60 * 1000, // 10分（ガベージコレクション）
            refetchOnWindowFocus: true, // 業界標準：タブ切り替え時にstaleなデータのみ再フェッチ
            refetchOnReconnect: 'always',
            retry: (failureCount, error) => {
              // エラーによってリトライ戦略を変更
              if (error && 'status' in error && error.status === 404) return false;
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            const headers: Record<string, string> = {};
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth_token');
              if (token) {
                headers.authorization = `Bearer ${token}`;
              }
            }
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <AuthStoreInitializer />
        <RealtimeProvider>
          <ThemeProvider>
            <GlobalSearchProvider>
              <ServiceWorkerProvider>
                {children}
                <GlobalTagCreateModal />
              </ServiceWorkerProvider>
            </GlobalSearchProvider>
          </ThemeProvider>
        </RealtimeProvider>
        {/* React Query DevTools（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </api.Provider>
    </QueryClientProvider>
  );
}
