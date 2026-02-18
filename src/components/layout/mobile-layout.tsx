'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { isCalendarViewPath } from '@/features/calendar/lib/route-utils';
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar';
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore';

import { MainContentWrapper } from './main-content-wrapper';

interface MobileLayoutProps {
  children: React.ReactNode;
  locale: 'ja' | 'en';
}

/**
 * モバイル用レイアウト
 *
 * **構成**:
 * - PageHeader（ナビゲーション + 検索）
 * - Sheet（左オーバーレイ）でサイドバーを表示
 * - MainContent
 *
 * **ドロワー仕様**:
 * - モーダル動作（オーバーレイシェードで親要素を覆う）
 * - ハンバーガーメニューで開閉
 * - エレベーション付き
 */
export function MobileLayout({ children, locale }: MobileLayoutProps) {
  // selector化: 必要な値だけ監視（他の状態変更時の再レンダリングを防止）
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const close = useSidebarStore((state) => state.close);

  // モバイルでの初期表示時にサイドバーを閉じる
  // デスクトップとストアを共有しているため、初期状態がtrueになる問題を解決
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      close();
      setIsInitialized(true);
    }
  }, [close, isInitialized]);

  // 初期化前は常にfalse、初期化後はストアの値を使用
  const sheetOpen = isInitialized ? isOpen : false;

  const pathname = usePathname();

  // ページ判定: カレンダービューかどうか（ヘッダー表示制御用）
  const isCalendarPage = useMemo(() => {
    const pathWithoutLocale = pathname?.replace(new RegExp(`^/${locale}`), '') ?? '';
    return isCalendarViewPath(pathWithoutLocale);
  }, [pathname, locale]);

  return (
    <>
      {/* モバイル: Sheet（左オーバーレイ）でSidebarを表示 */}
      <Sheet open={sheetOpen} onOpenChange={toggle}>
        <SheetContent
          side="left"
          className="p-0"
          showCloseButton={false}
          aria-label="Navigation menu"
        >
          <AppSidebar />
        </SheetContent>
      </Sheet>

      {/* PageHeader + Main Content */}
      <div className="flex h-full flex-1 flex-col">
        {/* PageHeader（Calendarは独自ヘッダーを持つため非表示） */}
        {!isCalendarPage && <PageHeader />}

        {/* Main Content */}
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  );
}
