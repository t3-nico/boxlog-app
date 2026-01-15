'use client';

import type { ReactNode } from 'react';

import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  /** セクションタイトル */
  title: string;
  /** セクションの子要素 */
  children: ReactNode;
  /** デフォルトで開いた状態にするか */
  defaultOpen?: boolean;
  /** 追加のクラス名（コンテンツ部分） */
  className?: string;
  /** ヘッダーに表示するアクション（開閉アイコンの左隣） */
  action?: ReactNode | undefined;
}

/**
 * SidebarSection - サイドバー共通セクションコンポーネント
 *
 * 全サイドバーで統一された折りたたみセクションを提供。
 *
 * **デザイン仕様（8pxグリッド準拠）**:
 * - ヘッダー高さ: 32px（h-8）
 * - 左右パディング: 8px（px-2）
 * - 上下パディング: 8px（py-2）
 * - ホバー: bg-state-hover（Material Design 3準拠）
 * - 角丸: rounded（4px - 内部小要素用）
 * - フォント: text-xs font-semibold
 * - アイコン: 16px（size-4）、右端配置、開閉時90度回転
 *
 * @example
 * ```tsx
 * <SidebarSection title="マイカレンダー" defaultOpen>
 *   <FilterItem label="Plan" checked={true} />
 *   <FilterItem label="Record" checked={false} />
 * </SidebarSection>
 * ```
 */
export function SidebarSection({
  title,
  children,
  defaultOpen = false,
  className,
  action,
}: SidebarSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="min-w-0 overflow-hidden">
      <div className="flex h-8 items-center">
        <CollapsibleTrigger className="text-muted-foreground hover:bg-state-hover flex h-8 min-w-0 flex-1 items-center rounded px-2 text-left text-xs font-semibold transition-colors">
          <span className="truncate">{title}</span>
        </CollapsibleTrigger>
        {action && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {action}
          </div>
        )}
        <CollapsibleTrigger className="text-muted-foreground hover:bg-state-hover flex size-6 shrink-0 items-center justify-center rounded transition-colors">
          <ChevronRight className="size-4 transition-transform [[data-state=open]>&]:rotate-90" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className={cn('min-w-0 overflow-hidden', className)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
