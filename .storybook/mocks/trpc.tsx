/**
 * Storybook用tRPCモック
 *
 * PlanCardなどtRPC hooksを使用するコンポーネントのStorybook表示に必要
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/react-query';
import type { ReactNode } from 'react';
import superjson from 'superjson';

import { api } from '@/lib/trpc';

// モック用のQueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

// モックtRPCクライアント（実際のAPIは呼ばない）
const trpcClient = api.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      transformer: superjson,
    }),
  ],
});

interface TRPCMockProviderProps {
  children: ReactNode;
}

/**
 * Storybook用tRPC Provider
 * 実際のAPIは呼ばず、コンポーネントのレンダリングのみを可能にする
 */
export function TRPCMockProvider({ children }: TRPCMockProviderProps) {
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
