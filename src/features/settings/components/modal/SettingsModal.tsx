'use client';

import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useSettingsModalURLSync } from '../../hooks/useSettingsModalURLSync';
import { useSettingsModalStore } from '../../stores/useSettingsModalStore';
import { SettingsModalContent } from './SettingsModalContent';
import { SettingsModalMobileView } from './SettingsModalMobileView';
import { SettingsModalSidebar } from './SettingsModalSidebar';

/**
 * URL同期を担当する内部コンポーネント
 * useSearchParams()はSuspenseが必要なため分離
 */
function SettingsURLSyncHandler() {
  useSettingsModalURLSync();
  return null;
}

/**
 * 設定モーダル
 *
 * Notion風フルスクリーンモーダル
 * - Desktop: Dialog (max-w-6xl)
 * - Mobile: Sheet (full screen)
 */
export function SettingsModal() {
  const t = useTranslations();
  const isOpen = useSettingsModalStore((state) => state.isOpen);
  const closeModal = useSettingsModalStore((state) => state.closeModal);
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // Mobile: Full-screen Sheet
  if (isMobile) {
    return (
      <>
        {/* URL同期（Suspenseでラップ） */}
        <Suspense fallback={null}>
          <SettingsURLSyncHandler />
        </Suspense>

        <Sheet open={isOpen} onOpenChange={(open) => !open && closeModal()}>
          <SheetContent
            side="bottom"
            className="h-[100dvh] p-0"
            showCloseButton={false}
            aria-label={t('settings.dialog.title')}
          >
            <SettingsModalMobileView />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Large Dialog
  return (
    <>
      {/* URL同期（Suspenseでラップ） */}
      <Suspense fallback={null}>
        <SettingsURLSyncHandler />
      </Suspense>

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className="flex h-[85vh] max-h-[800px] max-w-4xl gap-0 overflow-hidden p-0"
          showCloseButton={true}
        >
          {/* アクセシビリティ: DialogTitleが必須 */}
          <VisuallyHidden>
            <DialogTitle>{t('settings.dialog.title')}</DialogTitle>
          </VisuallyHidden>
          <SettingsModalSidebar className="border-border w-60 shrink-0 border-r" />
          <SettingsModalContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
