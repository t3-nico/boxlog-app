'use client';

import type { PlanItem } from '@/features/inbox/hooks/useInboxData';
import { PlanKanbanBoard } from './PlanKanbanBoard';

/**
 * Kanbanボードコンポーネント（メイン）
 *
 * PlanItemデータを受け取り、ステータスごとにカラム表示
 *
 * @example
 * ```tsx
 * <KanbanBoard items={planItems} />
 * ```
 */
export function KanbanBoard({ items }: { items: PlanItem[] }) {
  return <PlanKanbanBoard items={items} />;
}
