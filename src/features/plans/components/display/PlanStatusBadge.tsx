'use client';

import { Badge } from '@/components/ui/badge';
import type { PlanStatus } from '../../types/plan';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  PlanStatus,
  {
    label: string;
    className: string;
  }
> = {
  todo: {
    label: 'Todo',
    className: 'bg-surface-container text-muted-foreground border-border',
  },
  doing: {
    label: 'Doing',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  done: {
    label: 'Done',
    className: 'bg-success/10 text-success border-success/30',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function PlanStatusBadge({ status, size = 'sm' }: PlanStatusBadgeProps) {
  // フォールバック: 未知のステータスの場合はtodoとして扱う
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;

  return (
    <Badge variant="outline" className={`${config.className} ${SIZE_CLASSES[size]} font-medium`}>
      {config.label}
    </Badge>
  );
}
