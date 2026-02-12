'use client';

import { Plus, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Automation } from '../types';
import { AutomationCard } from './AutomationCard';

interface AutomationListProps {
  automations: Automation[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function AutomationList({
  automations,
  onToggle,
  onEdit,
  onDelete,
  onCreate,
}: AutomationListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">自動化ルール</h2>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <Plus className="size-4" />
          新規ルール
        </Button>
      </div>

      {automations.length === 0 ? (
        <div className="border-border flex flex-col items-center gap-4 rounded-xl border border-dashed py-12">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Zap className="text-muted-foreground size-6" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">まだルールがありません</p>
            <p className="text-muted-foreground mt-1 text-xs">
              繰り返しの作業を自動化するルールを作成しましょう
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Plus className="size-4" />
            最初のルールを作成
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
