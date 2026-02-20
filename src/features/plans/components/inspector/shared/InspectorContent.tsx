'use client';

import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { Spinner } from '@/components/ui/spinner';

interface InspectorContentProps {
  /** ローディング中かどうか */
  isLoading?: boolean;
  /** データが存在しない場合のメッセージ */
  emptyMessage?: string;
  /** データが存在するか */
  hasData?: boolean;
  /** コンテンツ */
  children: ReactNode;
  /** ローディングコンポーネント（カスタム） */
  loadingComponent?: ReactNode;
  /** 空状態コンポーネント（カスタム） */
  emptyComponent?: ReactNode;
}

/**
 * Inspectorコンテンツラッパー
 *
 * ローディング状態と空状態を統一的に処理
 *
 * @example
 * ```tsx
 * <InspectorContent
 *   isLoading={isLoading}
 *   hasData={!!plan}
 *   emptyMessage="プランが見つかりません"
 * >
 *   <PlanDetails plan={plan} />
 * </InspectorContent>
 * ```
 */
export function InspectorContent({
  isLoading = false,
  emptyMessage,
  hasData = true,
  children,
  loadingComponent,
  emptyComponent,
}: InspectorContentProps) {
  const t = useTranslations();
  const resolvedEmptyMessage = emptyMessage ?? t('plan.inspector.noData');

  // ローディング状態
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // 空状態
  if (!hasData) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-muted-foreground">{resolvedEmptyMessage}</p>
      </div>
    );
  }

  // 通常コンテンツ
  return <>{children}</>;
}
