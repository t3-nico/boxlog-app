'use client';

/**
 * アクティビティタイムラインPopover（共通コンポーネント）
 *
 * Plan/Record共通で使用する変更履歴表示
 * - Popover + History アイコントリガー
 * - タイムライン表示（アイコン + ラベル + 相対時間 + 詳細）
 * - ローディング / 空状態
 */

import type { LucideIcon } from 'lucide-react';
import { History } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { HoverTooltip } from '@/components/ui/tooltip';
/** アイコン色の種別 */
export type ActivityIconColor = 'success' | 'info' | 'warning' | 'primary' | 'destructive';

/** タイムラインに表示する1アイテム */
export interface ActivityDisplayItem {
  id: string;
  createdAt: string;
  label: string;
  detail?: string | undefined;
  icon: LucideIcon;
  iconColor: ActivityIconColor;
}

interface ActivityPopoverProps {
  /** フォーマット済みアクティビティ一覧 */
  items: ActivityDisplayItem[];
  /** データ読み込み中 */
  isPending: boolean;
}

function getIconColorClass(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'text-success';
    case 'destructive':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (locale === 'ja') {
    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  }

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function ActivityPopover({ items, isPending }: ActivityPopoverProps) {
  const locale = useLocale();
  const t = useTranslations('settings');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverTooltip content={t('tabs.activity')} side="top">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" icon aria-label={t('tabs.activity')}>
            <History className="size-5" />
          </Button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent align="end" sideOffset={8} className="z-overlay-popover w-80 p-0">
        <div className="px-4 py-4">
          <h3 className="text-sm font-bold">{t('tabs.activity')}</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              {t('activity.noActivity')}
            </div>
          ) : (
            <div className="px-4 py-4">
              {items.map((item, index) => {
                const IconComponent = item.icon;
                const isLast = index === items.length - 1;

                return (
                  <div key={item.id} className="flex gap-4">
                    {/* アイコン（色付き） */}
                    <div className="relative flex flex-col items-center">
                      <div className="bg-container relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
                        <IconComponent className={`size-4 ${getIconColorClass(item.iconColor)}`} />
                      </div>
                      {!isLast && (
                        <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm leading-8 font-bold">{item.label}</span>
                        <span className="text-muted-foreground mt-2 flex-shrink-0 text-xs">
                          {formatRelativeTime(item.createdAt, locale)}
                        </span>
                      </div>
                      {item.detail && (
                        <p className="text-muted-foreground -mt-1 text-xs">{item.detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
