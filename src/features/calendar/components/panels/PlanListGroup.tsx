'use client';

import type { ReactNode } from 'react';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PlanListGroupProps {
  /** グループラベル */
  label: string;
  /** アイテム数 */
  count: number;
  /** 折りたたみ状態 */
  isCollapsed: boolean;
  /** 折りたたみ切り替え */
  onToggle: () => void;
  /** グループ内のアイテム */
  children: ReactNode;
}

/**
 * サイドパネル用のグループヘッダー + 折りたたみコンテンツ
 */
export function PlanListGroup({
  label,
  count,
  isCollapsed,
  onToggle,
  children,
}: PlanListGroupProps) {
  return (
    <div>
      {/* グループヘッダー */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-1.5 py-1.5',
          'text-muted-foreground hover:text-foreground',
          'transition-colors duration-150',
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5 shrink-0" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0" />
        )}
        <span className="text-xs font-medium">{label}</span>
        <span className="text-muted-foreground/60 text-[10px]">({count})</span>
      </button>

      {/* グループコンテンツ */}
      {!isCollapsed && <div className="flex flex-col gap-2 pb-2">{children}</div>}
    </div>
  );
}
