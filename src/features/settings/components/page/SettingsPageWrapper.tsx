'use client';

import { useRouter } from 'next/navigation';

import { ChevronLeft } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

interface SettingsPageWrapperProps {
  title: string;
  children: React.ReactNode;
}

/**
 * 設定ページの共通ラッパー
 *
 * - ヘッダー（PageHeaderを使用、モバイルは戻るボタン）
 * - スクロール可能なコンテンツ領域
 */
export function SettingsPageWrapper({ title, children }: SettingsPageWrapperProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex h-full flex-col">
      {/* PC: 共通PageHeader（背景は親のbg-surface-brightを継承） */}
      <div className="hidden md:block">
        <PageHeader title={title} showMobileMenu={false} className="bg-transparent" />
      </div>

      {/* モバイル: 戻るボタン付きヘッダー（背景は親を継承） */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-4 py-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2 size-8"
          aria-label={t('common.back')}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="truncate text-lg font-semibold">{title}</h1>
      </header>

      {/* コンテンツ */}
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}
