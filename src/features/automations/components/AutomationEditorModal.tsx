'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/features/tags/types';

import type {
  ActionConfig,
  ActionType,
  Automation,
  AutomationCondition,
  ConditionField,
} from '../types';
import { ActionConfigurator } from './ActionConfigurator';
import { TriggerPicker } from './TriggerPicker';

/** conditionsからfield/valueを復元 */
function extractTrigger(conditions: AutomationCondition[]): {
  field: ConditionField | undefined;
  value: string;
  tagIds: string[];
} {
  const first = conditions[0];
  if (!first) return { field: undefined, value: '', tagIds: [] };

  if (first.field === 'tagIds') {
    const ids = Array.isArray(first.value) ? first.value : [first.value];
    return { field: first.field, value: '', tagIds: ids };
  }

  if (first.field === 'fulfillment' || first.field === 'duration') {
    const val = typeof first.value === 'string' ? first.value : (first.value[0] ?? '');
    return { field: first.field, value: `${first.operator}:${val}`, tagIds: [] };
  }

  if (first.field === 'timeRange') {
    const val = typeof first.value === 'string' ? first.value : (first.value[0] ?? '');
    return { field: first.field, value: val, tagIds: [] };
  }

  return {
    field: first.field,
    value: typeof first.value === 'string' ? first.value : first.value.join(', '),
    tagIds: [],
  };
}

/** field/value/tagIdsからconditions配列を生成 */
function buildConditions(
  field: ConditionField | undefined,
  value: string,
  tagIds: string[],
): AutomationCondition[] {
  if (!field) return [];

  if (field === 'tagIds') {
    if (tagIds.length === 0) return [];
    return [{ field, operator: 'in', value: tagIds }];
  }

  if (field === 'fulfillment') {
    const [operator, score] = value.split(':');
    if (!operator || !score) return [];
    return [{ field, operator: operator as 'gte' | 'lte' | 'equals', value: score }];
  }

  if (field === 'duration') {
    const [operator, minutes] = value.split(':');
    if (!operator || !minutes) return [];
    return [{ field, operator: operator as 'gte' | 'lte', value: minutes }];
  }

  if (field === 'timeRange') {
    if (!value.includes('-')) return [];
    return [{ field, operator: 'between', value }];
  }

  if (field === 'recurrence') {
    if (!value || value.trim() === '') return [];
    return [{ field, operator: 'equals', value: value.trim() }];
  }

  if (value.trim() === '') return [];

  const operator = field === 'status' ? ('equals' as const) : ('contains' as const);

  return [{ field, operator, value: value.trim() }];
}

interface AutomationEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: Automation;
  onSave: (data: {
    name: string;
    conditions: AutomationCondition[];
    action_type: ActionType;
    action_config: ActionConfig;
  }) => void;
  /** Storybook用: タグ一覧を注入 */
  availableTags?: Tag[];
}

export function AutomationEditorModal({
  open,
  onOpenChange,
  automation,
  onSave,
  availableTags,
}: AutomationEditorModalProps) {
  const initialTrigger = extractTrigger(automation?.conditions ?? []);

  const [name, setName] = useState(automation?.name ?? '');
  const [triggerField, setTriggerField] = useState<ConditionField | undefined>(
    initialTrigger.field,
  );
  const [triggerValue, setTriggerValue] = useState(initialTrigger.value);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTrigger.tagIds);
  const [actionType, setActionType] = useState<ActionType | undefined>(automation?.action_type);
  const [actionConfig, setActionConfig] = useState<ActionConfig | undefined>(
    automation?.action_config,
  );

  const hasTriggerValue = (() => {
    if (triggerField === 'tagIds') return selectedTagIds.length > 0;
    if (triggerField === 'fulfillment') {
      const [op, score] = triggerValue.split(':');
      return Boolean(op && score);
    }
    if (triggerField === 'duration') {
      const [op, minutes] = triggerValue.split(':');
      return Boolean(op && minutes);
    }
    if (triggerField === 'timeRange') return triggerValue.includes('-');
    return triggerValue.trim().length > 0;
  })();

  const isValid =
    name.trim().length > 0 &&
    triggerField !== undefined &&
    hasTriggerValue &&
    actionType !== undefined &&
    actionConfig !== undefined;

  function handleSave() {
    if (!isValid || !actionType || !actionConfig) return;
    onSave({
      name: name.trim(),
      conditions: buildConditions(triggerField, triggerValue, selectedTagIds),
      action_type: actionType,
      action_config: actionConfig,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{automation ? 'ルールを編集' : '新しいルール'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="automation_name">ルール名</Label>
            <Input
              id="automation_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 完了時にレコードを自動作成"
            />
          </div>

          {/* ステップ 1: きっかけ */}
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium">ステップ 1 — きっかけ</p>
            <TriggerPicker
              field={triggerField}
              value={triggerValue}
              selectedTagIds={selectedTagIds}
              onFieldChange={setTriggerField}
              onValueChange={setTriggerValue}
              onTagIdsChange={setSelectedTagIds}
              availableTags={availableTags}
            />
          </div>

          {/* ステップ 2: アクション */}
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium">
              ステップ 2 — アクション
            </p>
            <ActionConfigurator
              actionType={actionType}
              actionConfig={actionConfig}
              onActionTypeChange={setActionType}
              onConfigChange={setActionConfig}
              availableTags={availableTags}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!isValid}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
