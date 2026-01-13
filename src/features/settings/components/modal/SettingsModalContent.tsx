'use client';

import { useTranslations } from 'next-intl';
import { Suspense, lazy } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { SETTINGS_CATEGORIES } from '../../constants';
import { useSettingsModalStore } from '../../stores/useSettingsModalStore';
import type { SettingsCategory } from '../../types';

// 各設定コンポーネントを遅延読み込み
// memo()でラップされたコンポーネントも含むため、ComponentType<object>を使用
const categoryComponents: Record<
  SettingsCategory,
  React.LazyExoticComponent<React.ComponentType<object>>
> = {
  general: lazy(() =>
    import('../preferences-settings').then((m) => ({ default: m.PreferencesSettings })),
  ),
  calendar: lazy(() =>
    import('../calendar-settings').then((m) => ({ default: m.CalendarSettings })),
  ),
  personalization: lazy(() =>
    import('../chronotype-settings').then((m) => ({ default: m.ChronotypeSettings })),
  ),
  tags: lazy(() =>
    Promise.all([
      import('@/features/tags/components/TagsPageClient'),
      import('@/features/tags/contexts/TagsPageContext'),
    ]).then(([{ TagsPageClient }, { TagsPageProvider }]) => ({
      default: () => (
        <TagsPageProvider>
          <TagsPageClient />
        </TagsPageProvider>
      ),
    })),
  ),
  notifications: lazy(() =>
    import('../notification-settings').then((m) => ({ default: m.NotificationSettings })),
  ),
  'data-controls': lazy(() =>
    import('../data-export-settings').then((m) => ({
      default: m.DataExportSettings as React.ComponentType<object>,
    })),
  ),
  integrations: lazy(() =>
    import('../integration-settings').then((m) => ({ default: m.IntegrationSettings })),
  ),
  account: lazy(() => import('../account-settings').then((m) => ({ default: m.AccountSettings }))),
  subscription: lazy(() =>
    import('../plan-billing-settings').then((m) => ({ default: m.PlanBillingSettings })),
  ),
};

/**
 * 設定モーダルのコンテンツエリア
 *
 * 選択されたカテゴリに応じてコンポーネントを遅延読み込み
 */
export function SettingsModalContent() {
  const t = useTranslations();
  const selectedCategory = useSettingsModalStore((state) => state.selectedCategory);
  const CategoryComponent = categoryComponents[selectedCategory];

  // 現在のカテゴリのラベルを取得
  const currentCategory = SETTINGS_CATEGORIES.find((cat) => cat.id === selectedCategory);
  const categoryLabel = currentCategory ? t(currentCategory.labelKey) : '';

  // Tagsカテゴリは独自のレイアウトを持つため、パディングなしで表示
  const isTagsCategory = selectedCategory === 'tags';

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* ヘッダー - サイドバーと同じ高さ */}
      <div className="flex h-12 shrink-0 items-center px-6">
        <h2 className="text-lg font-semibold">{categoryLabel}</h2>
      </div>
      {/* コンテンツ */}
      {isTagsCategory ? (
        // Tagsカテゴリは独自のスクロール・レイアウトを持つため、ScrollAreaなしで表示
        <div className="min-h-0 flex-1 overflow-hidden">
          <Suspense fallback={<SettingsLoadingSkeleton />}>
            <CategoryComponent />
          </Suspense>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-6 pt-0">
          <Suspense fallback={<SettingsLoadingSkeleton />}>
            <CategoryComponent />
          </Suspense>
        </div>
      )}
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
