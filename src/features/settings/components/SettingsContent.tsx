'use client';

import { Suspense, lazy, useEffect } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { CACHE_5_MINUTES } from '@/constants/time';
import { api } from '@/lib/trpc';

import type { SettingsCategory } from '../types';

const categoryComponents: Record<
  SettingsCategory,
  React.LazyExoticComponent<React.ComponentType<object>>
> = {
  general: lazy(() => import('./general-settings').then((m) => ({ default: m.GeneralSettings }))),
  calendar: lazy(() =>
    import('./calendar-settings').then((m) => ({ default: m.CalendarSettings })),
  ),
  personalization: lazy(() =>
    import('./personalization-page').then((m) => ({ default: m.PersonalizationPage })),
  ),
  notifications: lazy(() =>
    import('./notification-settings').then((m) => ({ default: m.NotificationSettings })),
  ),
  account: lazy(() => import('./account-settings').then((m) => ({ default: m.AccountSettings }))),
};

const VALID_CATEGORIES = new Set<string>([
  'general',
  'calendar',
  'personalization',
  'notifications',
  'account',
]);

export function isValidCategory(category: string): category is SettingsCategory {
  return VALID_CATEGORIES.has(category);
}

interface SettingsContentProps {
  category: SettingsCategory;
}

/**
 * 設定コンテンツエリア
 *
 * カテゴリに応じたコンポーネントを遅延読み込みで表示
 * ルーティングページとダイアログの両方で再利用
 */
export function SettingsContent({ category }: SettingsContentProps) {
  const CategoryComponent = categoryComponents[category];
  const utils = api.useUtils();

  // マウント時に設定データをプリフェッチ
  useEffect(() => {
    void utils.userSettings.get.prefetch(undefined, { staleTime: CACHE_5_MINUTES });
    void utils.notificationPreferences.get.prefetch();
  }, [utils]);

  return (
    <div className="min-h-0 flex-1 overflow-auto p-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <CategoryComponent />
      </Suspense>
    </div>
  );
}

function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
