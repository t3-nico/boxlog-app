'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore';
import { usePageTitle } from '@/features/navigation/hooks/usePageTitle';

interface InboxLayoutProps {
  children: ReactNode;
}

/**
 * Inbox共通レイアウト
 *
 * URLパスからactiveViewIdを同期
 * サイドバーはDesktopLayoutで共通管理
 */
export default function InboxLayout({ children }: InboxLayoutProps) {
  const pathname = usePathname();
  const { setActiveView, getActiveView } = useInboxViewStore();
  const activeView = getActiveView();

  // URLパスからviewIdへのマッピング
  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    // パスからviewId決定
    let viewId: string;
    if (lastSegment === 'all') {
      viewId = 'default-all';
    } else if (lastSegment === 'archive') {
      viewId = 'default-archive';
    } else if (segments[segments.length - 2] === 'view') {
      viewId = lastSegment ?? 'default-all'; // カスタムビューID
    } else {
      viewId = 'default-all'; // デフォルト
    }

    setActiveView(viewId);
  }, [pathname, setActiveView]);

  // タイトルをZustand Storeにセット（PageHeaderはレイアウト層でレンダリング）
  usePageTitle(activeView?.name || 'Inbox');

  return <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
}
