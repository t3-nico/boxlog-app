'use client';

import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

import type { badgeVariants } from '@/components/ui/badge';
import type { PlanStatus } from '../../types/plan';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  PlanStatus,
  {
    label: string;
    variant: VariantProps<typeof badgeVariants>['variant'];
  }
> = {
  open: {
    label: 'Open',
    variant: 'outline',
  },
  closed: {
    label: 'Closed',
    variant: 'success',
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
    <Badge variant={config.variant} className={`${SIZE_CLASSES[size]} font-normal`}>
      {config.label}
    </Badge>
  );
}
