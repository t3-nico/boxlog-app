'use client';

import { useRouter } from '@/i18n/navigation';

import { useTranslations } from 'next-intl';

import { XIcon } from 'lucide-react';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import type { SettingsCategory } from '../types';
import { SettingsContent } from './SettingsContent';
import { SettingsSidebar } from './SettingsSidebar';

interface SettingsDialogProps {
  category: SettingsCategory;
}

/**
 * 設定ダイアログ（PC インターセプト時に使用）
 *
 * SettingsSidebar + SettingsContent を Dialog 内に配置
 * 閉じる → router.back() で前のページに戻る
 */
export function SettingsDialog({ category }: SettingsDialogProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[85vh] max-h-[800px] max-w-4xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{t('settings.dialog.title')}</DialogTitle>
        </VisuallyHidden>
        <SettingsSidebar className="border-border w-60 shrink-0 border-r" />
        <div className="bg-background flex h-full min-w-0 flex-1 flex-col">
          <SettingsContent category={category} />
        </div>
        <DialogClose className="text-muted-foreground hover:text-foreground hover:bg-state-hover active:bg-state-hover focus-visible:ring-ring absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-hidden">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
