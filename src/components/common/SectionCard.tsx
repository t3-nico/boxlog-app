'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

/**
 * 設定セクションコンポーネント（フラット + セパレーター方式）
 *
 * カード風UIではなく、セパレーターで区切るフラットなスタイル。
 * ChatGPT設定画面風のシンプルなデザイン。
 */
export function SectionCard({ title, children, className, actions }: SectionCardProps) {
  return (
    <section className={cn('text-foreground', className)}>
      <div>
        {(title || actions) && (
          <div className="border-border mb-2 flex items-center justify-between border-b pb-2">
            {title ? <h2 className="text-foreground text-lg font-normal">{title}</h2> : <div />}
            {actions ? (
              <div className="flex flex-shrink-0 items-center gap-4">{actions}</div>
            ) : null}
          </div>
        )}
        <div className="text-base">{children}</div>
      </div>
    </section>
  );
}
