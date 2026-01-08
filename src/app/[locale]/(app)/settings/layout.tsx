'use client';

import { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { ChevronLeft, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SETTINGS_CATEGORIES } from '@/features/settings/constants';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * 設定ページレイアウト
 *
 * PC: DesktopLayoutのサイドバー + メインコンテンツ
 * モバイル: スタック遷移（メイン画面 or 詳細画面）
 *
 * PCではDesktopLayoutがSettingsSidebarを表示するため、
 * このlayout.tsxはモバイル用のサイドバーとコンテンツの表示切り替えを担当。
 */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 現在のカテゴリを判定
  const currentCategory = SETTINGS_CATEGORIES.find((cat) =>
    pathname?.includes(`/settings/${cat.id}`),
  )?.id;

  // モバイルでカテゴリが選択されているか
  const isInCategory = currentCategory !== undefined;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success(t('navUser.logoutSuccess'));
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('navUser.logoutFailed'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-background flex h-full w-full">
      {/* モバイル用サイドバー: カテゴリ未選択時のみ表示（PCでは非表示） */}
      <aside
        className={cn(
          'border-border h-full flex-shrink-0 border-r',
          // PC: 非表示（DesktopLayoutのSettingsSidebarを使用）
          'md:hidden',
          // モバイル: カテゴリ未選択時は全幅、選択時は非表示
          isInCategory ? 'hidden' : 'w-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <header className="border-border flex h-14 items-center gap-2 border-b px-4">
            {/* 戻るボタン */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 h-10 w-10"
              aria-label={t('common.back')}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold">{t('settings.dialog.title')}</h1>
          </header>

          {/* カテゴリリスト */}
          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 p-2">
              {SETTINGS_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const href = `/${locale}/settings/${category.id}`;

                return (
                  <Link
                    key={category.id}
                    href={href}
                    className="text-muted-foreground active:bg-state-hover flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="font-medium">{t(category.labelKey)}</span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-border my-1 border-t" />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive active:bg-state-hover flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-50"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="font-medium">
                  {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
                </span>
              </button>
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main
        className={cn(
          'bg-surface-bright flex h-full min-h-0 flex-1 flex-col overflow-hidden',
          // モバイル: カテゴリ選択時のみ表示、PC: 常時表示
          isInCategory ? 'block' : 'hidden md:block',
        )}
      >
        {children}
      </main>
    </div>
  );
}
