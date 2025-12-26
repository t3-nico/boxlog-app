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
  icon?: LucideIcon;
}

/**
 * Plans用EmptyState
 *
 * 共通EmptyStateのラッパー。後方互換性のために残存。
 */
export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <BaseEmptyState
      title={title}
      description={description}
      icon={icon}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
