'use client';

import { Pencil, Trash2, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import type { Automation, AutomationCondition } from '../types';

const TRIGGER_LABELS: Record<string, string> = {
  'plan.status_changed': 'ステータス変更時',
  'plan.created': 'プラン作成時',
  'record.created': 'レコード作成時',
  'record.updated': 'レコード更新時',
};

const OPERATOR_LABELS: Record<string, string> = {
  gte: '以上',
  lte: '以下',
  equals: '等しい',
  between: '範囲',
};

const RECURRENCE_LABELS: Record<string, string> = {
  none: 'なし',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
};

function summarizeCondition(condition: AutomationCondition): string {
  const val = typeof condition.value === 'string' ? condition.value : condition.value.join(', ');
  const opLabel = OPERATOR_LABELS[condition.operator] ?? condition.operator;

  switch (condition.field) {
    case 'status':
      return `ステータス: ${val}`;
    case 'tagIds':
      return `タグ: ${Array.isArray(condition.value) ? condition.value.length : 1}件`;
    case 'fulfillment':
      return `充実度 ${opLabel} ${val}`;
    case 'duration':
      return `所要時間 ${opLabel} ${val}分`;
    case 'timeRange':
      return `時間帯: ${val.replace('-', ' 〜 ')}`;
    case 'title':
      return `タイトル: "${val}"`;
    case 'recurrence':
      return `繰り返し: ${RECURRENCE_LABELS[val] ?? val}`;
    default:
      return val;
  }
}

const ACTION_LABELS: Record<string, string> = {
  create_record: 'レコード作成',
  send_notification: '通知送信',
  add_tags: 'タグ付与',
};

interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AutomationCard({ automation, onToggle, onEdit, onDelete }: AutomationCardProps) {
  const triggerLabel = TRIGGER_LABELS[automation.trigger_type] ?? automation.trigger_type;
  const actionLabel = ACTION_LABELS[automation.action_type] ?? automation.action_type;

  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-xl border p-4">
      <div className="flex shrink-0 items-center">
        <Switch
          checked={automation.is_enabled}
          onCheckedChange={(checked) => onToggle(automation.id, checked)}
          aria-label={`Toggle ${automation.name}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Zap className="text-muted-foreground size-4 shrink-0" />
          <span className="text-foreground truncate text-sm font-medium">{automation.name}</span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {triggerLabel} → {actionLabel}
          {automation.conditions.length > 0 && (
            <span className="ml-1">
              ({automation.conditions.map(summarizeCondition).join(', ')})
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {automation.trigger_count > 0 && (
          <Badge variant="secondary">{automation.trigger_count} 回実行</Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon
          onClick={() => onEdit(automation.id)}
          aria-label={`Edit ${automation.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon
          onClick={() => onDelete(automation.id)}
          aria-label={`Delete ${automation.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
