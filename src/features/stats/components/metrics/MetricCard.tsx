'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { MetricTrend } from '../../types/metrics.types';

/** 閾値ベースのステータス */
type ThresholdStatus = 'good' | 'warning' | 'critical';

const STATUS_BORDER_CLASSES: Record<ThresholdStatus, string> = {
  good: 'border-l-2 border-l-emerald-500',
  warning: 'border-l-2 border-l-amber-500',
  critical: 'border-l-2 border-l-red-500',
};

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  trend?: MetricTrend | undefined;
  /** 閾値ベースの色分け（左ボーダー） */
  status?: ThresholdStatus | undefined;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  description,
  trend,
  status,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-7 w-16 rounded" />
            <div className="bg-muted h-3 w-24 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(status && STATUS_BORDER_CLASSES[status])}>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-bold">{value}</span>
          {trend && trend.direction !== 'flat' && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trend.isPositive ? 'text-emerald-500' : 'text-red-500',
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(Math.round(trend.delta * 100))}%
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
