/**
 * Inspector Stories 共通ヘルパー
 *
 * Plan/Record の Inspector Stories で共通利用するモックデータとコンポーネント
 */

import { FolderOpen, X } from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';
import type { Tag } from '@/core/types/tag';
import { cn } from '@/lib/utils';

/** Inspector風コンテナ（400px幅） */
export function InspectorFrame({
  children,
  variant,
}: {
  children: React.ReactNode;
  /** variant を指定すると左ボーダーでタイプを視覚的に区別 */
  variant?: 'plan' | 'record' | undefined;
}) {
  return (
    <div
      className={cn(
        'bg-card border-border w-[400px] overflow-hidden rounded-xl border shadow-lg',
        variant === 'plan' && 'border-l-plan-border border-l-[3px]',
        variant === 'record' && 'border-l-record-border border-l-[3px]',
      )}
    >
      {children}
    </div>
  );
}

/** Plan紐付けボタン（静的表示 / Storybook用モック） */
export function MockPlanLinkButton({ planName }: { planName?: string | undefined }) {
  const hasPlan = !!planName;

  return (
    <HoverTooltip content={planName ?? 'Planに紐付け'} side="top">
      <div
        className={cn(
          'hover:bg-state-hover flex h-8 items-center rounded-lg transition-colors',
          hasPlan ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <button
          type="button"
          className="focus-visible:ring-ring flex items-center gap-1 px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Planに紐付け"
        >
          <FolderOpen className="size-4" />
          {hasPlan && <span className="max-w-20 truncate text-xs">{planName}</span>}
        </button>
        {hasPlan && (
          <button
            type="button"
            className="hover:bg-state-hover mr-1 rounded p-1 transition-colors"
            aria-label="Plan紐付けを解除"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </HoverTooltip>
  );
}

/** モック用タグデータ */
export const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: '仕事',
    user_id: 'user-1',
    color: '#3B82F6',
    description: '仕事関連のタスク',
    is_active: true,
    parent_id: null,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-2',
    name: '重要',
    user_id: 'user-1',
    color: '#EF4444',
    description: '重要なタスク',
    is_active: true,
    parent_id: null,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-3',
    name: '個人',
    user_id: 'user-1',
    color: '#10B981',
    description: null,
    is_active: true,
    parent_id: null,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];
