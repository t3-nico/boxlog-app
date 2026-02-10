'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLocale } from 'next-intl';

import { Spinner } from '@/components/ui/spinner';
import { useCalendarPanelStore } from '@/features/calendar/stores/useCalendarPanelStore';

/**
 * Recordコンテンツ
 *
 * カレンダー + サイドパネルにリダイレクト
 */
export function RecordContent() {
  const router = useRouter();
  const locale = useLocale();
  const openPanel = useCalendarPanelStore.use.openPanel();

  useEffect(() => {
    openPanel('record');
    router.replace(`/${locale}/calendar`);
  }, [router, locale, openPanel]);

  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
