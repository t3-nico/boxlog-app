'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  closeModal as closeModalAction,
  useModalStore,
  type SettingsCategory,
} from '@/stores/useModalStore';
import { SETTINGS_CATEGORIES } from '../../constants';
import { SettingsModalContent } from './SettingsModalContent';

/**
 * 設定モーダルのモバイル表示
 *
 * リスト表示と詳細表示をスタック形式で切り替え
 */
export function SettingsModalMobileView() {
  const t = useTranslations();
  const modal = useModalStore((state) => state.modal);
  const setSettingsCategory = useModalStore((state) => state.setSettingsCategory);
  const selectedCategory = modal?.type === 'settings' ? modal.category : 'general';
  const handleClose = closeModalAction;
  const [showContent, setShowContent] = useState(false);

  const handleCategorySelect = (category: SettingsCategory) => {
    setSettingsCategory(category);
    setShowContent(true);
  };

  const handleBack = () => {
    setShowContent(false);
  };

  // カテゴリコンテンツ表示
  if (showContent) {
    const currentCategory = SETTINGS_CATEGORIES.find((c) => c.id === selectedCategory);

    return (
      <div className="flex h-full flex-col">
        <header className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" icon onClick={handleBack} aria-label={t('common.back')}>
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-lg font-bold">
              {currentCategory ? t(currentCategory.labelKey) : ''}
            </h1>
          </div>
          <Button variant="ghost" icon onClick={handleClose} aria-label={t('common.actions.close')}>
            <X className="size-5" />
          </Button>
        </header>
        <SettingsModalContent />
      </div>
    );
  }

  // カテゴリリスト表示
  return (
    <div className="flex h-full flex-col">
      <header className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h1 className="text-lg font-bold">{t('settings.dialog.title')}</h1>
        <Button variant="ghost" icon onClick={handleClose} aria-label={t('common.actions.close')}>
          <X className="size-5" />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {SETTINGS_CATEGORIES.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className="text-foreground hover:bg-state-hover active:bg-state-hover flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-sm transition-colors"
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1 font-normal">{t(category.labelKey)}</span>
                <ChevronRight className="text-muted-foreground size-4" />
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
