'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavigationTabItemProps {
  icon: LucideIcon;
  label: string;
  url: string;
  isActive: boolean;
}

/**
 * ナビゲーションタブアイテム
 *
 * セグメンテッドコントロールスタイルの個別アイテム
 * - アイコンのみ表示（32x32px）
 * - ホバーでtooltipにラベル表示
 * - 選択中はピル型背景（rounded-full）
 */
export function NavigationTabItem({ icon: Icon, label, url, isActive }: NavigationTabItemProps) {
  return (
    <HoverTooltip content={label} side="bottom">
      <Link
        href={url}
        prefetch={true}
        aria-label={label}
        className={cn(
          'flex h-8 w-10 items-center justify-center rounded-full transition-colors',
          isActive
            ? 'bg-primary-container text-on-primary-container hover:bg-primary-container/90'
            : 'text-muted-foreground hover:bg-foreground/8 hover:text-foreground',
        )}
      >
        <Icon className="size-4" strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </HoverTooltip>
  );
}
