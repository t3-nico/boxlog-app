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
  open: {
    label: 'Open',
    className: 'bg-surface-container text-muted-foreground border-border',
  },
  closed: {
    label: 'Closed',
    className: 'bg-success/10 text-success border-success/30',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-4 py-1',
  lg: 'text-base px-4 py-2',
};

export function PlanStatusBadge({ status, size = 'sm' }: PlanStatusBadgeProps) {
  // フォールバック: 未知のステータスの場合はopenとして扱う
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;

  return (
    <Badge variant="outline" className={`${config.className} ${SIZE_CLASSES[size]} font-normal`}>
      {config.label}
    </Badge>
  );
}
