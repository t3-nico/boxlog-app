'use client';

import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string | undefined;
  /** アイコン（Lucideアイコンコンポーネント） */
  icon?: LucideIcon | undefined;
  /** アクションボタンのラベル */
  actionLabel?: string | undefined;
  /** アクションボタンのコールバック */
  onAction?: (() => void) | undefined;
  /** カスタムアクション（Buttonなど） */
  actions?: React.ReactNode | undefined;
  /** ヒントテキスト */
  hint?: string | undefined;
  /** 追加のクラス名 */
  className?: string | undefined;
}

/**
 * 統一EmptyStateコンポーネント
 *
 * GAFA風のシンプルなデザイン：
 * - アイコン: 48px、装飾なし
 * - タイトル: text-lg font-semibold
 * - 説明: text-sm text-muted-foreground
 *
 * @example
 * ```tsx
 * import { EmptyState } from '@/components/common'
 * import { CalendarDays } from 'lucide-react'
 *
 * // 基本
 * <EmptyState
 *   icon={CalendarDays}
 *   title="予定がありません"
 *   description="カレンダーで新しい予定を作成してください"
 * />
 *
 * // アクションボタン付き
 * <EmptyState
 *   icon={Inbox}
 *   title="メッセージがありません"
 *   actionLabel="新規作成"
 *   onAction={() => openDialog()}
 * />
 *
 * // カスタムアクション
 * <EmptyState
 *   icon={Search}
 *   title="検索結果がありません"
 *   actions={<Button variant="outline" onClick={reset}>フィルターをリセット</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  actions,
  hint,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center px-4 py-8 text-center md:p-8',
        className,
      )}
    >
      {/* アイコン */}
      {Icon && <Icon className="text-muted-foreground size-12" />}

      {/* タイトル */}
      <h3 className="text-foreground mt-6 text-lg font-semibold">{title}</h3>

      {/* 説明 */}
      {description && (
        <p className="text-muted-foreground mt-2 mb-6 text-sm md:max-w-md">{description}</p>
      )}

      {/* アクションボタン */}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}

      {/* カスタムアクション */}
      {actions && <div>{actions}</div>}

      {/* ヒント */}
      {hint && <p className="text-muted-foreground mt-8 max-w-xs text-xs md:max-w-sm">{hint}</p>}
    </div>
  );
}
