'use client';

import React from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
  isSaving?: boolean;
}

/**
 * 設定セクションコンポーネント（フラット + セパレーター方式）
 *
 * カード風UIではなく、セパレーターで区切るフラットなスタイル。
 * ChatGPT設定画面風のシンプルなデザイン。
 */
export const SettingsCard = ({
  title,
  children,
  className,
  actions,
  noPadding = false,
  isSaving = false,
}: SettingsCardProps) => {
  return (
    <section className={cn('text-foreground', isSaving && 'opacity-70', className)}>
      <div className={cn(noPadding ? '' : '')}>
        {(title || actions || isSaving) && (
          <div className="border-border mb-2 flex items-center justify-between border-b pb-2">
            {title ? <h2 className="text-foreground text-lg font-normal">{title}</h2> : <div />}
            <div className="flex flex-shrink-0 items-center gap-3">
              {isSaving === true && (
                <div className="text-primary flex items-center gap-2 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>保存中...</span>
                </div>
              )}
              {actions ? <div>{actions}</div> : null}
            </div>
          </div>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </section>
  );
};
