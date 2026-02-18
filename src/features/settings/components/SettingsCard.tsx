'use client';

import type { ReactNode } from 'react';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  isSaving?: boolean;
}

/**
 * 設定セクションコンポーネント（フラット + セパレーター方式）
 *
 * カード風UIではなく、セパレーターで区切るフラットなスタイル。
 * ChatGPT設定画面風のシンプルなデザイン。
 */
export function SettingsCard({
  title,
  children,
  className,
  actions,
  isSaving = false,
}: SettingsCardProps) {
  const t = useTranslations();

  return (
    <section className={cn('text-foreground', isSaving && 'opacity-70', className)}>
      <div>
        {(title || actions || isSaving) && (
          <div className="border-border mb-2 flex items-center justify-between border-b pb-2">
            {title ? <h2 className="text-foreground text-lg font-normal">{title}</h2> : <div />}
            <div className="flex flex-shrink-0 items-center gap-4">
              {isSaving === true && (
                <div className="text-primary flex items-center gap-2 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t('actions.saving')}</span>
                </div>
              )}
              {actions ? <div>{actions}</div> : null}
            </div>
          </div>
        )}
        <div className="text-base">{children}</div>
      </div>
    </section>
  );
}
