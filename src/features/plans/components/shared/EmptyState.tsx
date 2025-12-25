'use client';

/**
 * Plans用EmptyStateコンポーネント
 *
 * @deprecated 共通コンポーネント `@/components/common/EmptyState` を使用してください
 */

import type { LucideIcon } from 'lucide-react';

import { EmptyState as BaseEmptyState } from '@/components/common';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon | React.ReactNode;
}

/**
 * Plans用EmptyState
 *
 * 共通EmptyStateのラッパー。後方互換性のために残存。
 */
export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  // アイコンがコンポーネント型かどうかを判定
  const isIconComponent =
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && '$$typeof' in icon && 'render' in icon);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = isIconComponent ? (icon as any) : undefined;

  return (
    <BaseEmptyState
      title={title}
      description={description}
      icon={IconComponent}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
