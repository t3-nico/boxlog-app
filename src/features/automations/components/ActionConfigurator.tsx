'use client';

import { ChevronDown } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Tag } from '@/features/tags/types';

import type {
  ActionConfig,
  ActionType,
  AddTagsConfig,
  CreateRecordConfig,
  SendNotificationConfig,
} from '../types';

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'create_record', label: 'レコードを作成' },
  { value: 'send_notification', label: '通知を送信' },
  { value: 'add_tags', label: 'タグを付与' },
];

interface ActionConfiguratorProps {
  actionType: ActionType | undefined;
  actionConfig: ActionConfig | undefined;
  onActionTypeChange: (type: ActionType) => void;
  onConfigChange: (config: ActionConfig) => void;
  availableTags?: Tag[] | undefined;
}

function isCreateRecordConfig(
  config: ActionConfig | undefined,
  type: ActionType | undefined,
): config is CreateRecordConfig {
  return type === 'create_record' && config !== undefined;
}

function isSendNotificationConfig(
  config: ActionConfig | undefined,
  type: ActionType | undefined,
): config is SendNotificationConfig {
  return type === 'send_notification' && config !== undefined;
}

function isAddTagsConfig(
  config: ActionConfig | undefined,
  type: ActionType | undefined,
): config is AddTagsConfig {
  return type === 'add_tags' && config !== undefined;
}

const DEFAULT_CREATE_RECORD: CreateRecordConfig = {
  copy_time: true,
  copy_tags: true,
};

const DEFAULT_NOTIFICATION: SendNotificationConfig = {
  title: '',
  message: '',
};

const DEFAULT_ADD_TAGS: AddTagsConfig = {
  tag_ids: [],
};

function flattenTags(tags: Tag[]): Tag[] {
  const result: Tag[] = [];
  for (const tag of tags) {
    result.push(tag);
    if (tag.children && tag.children.length > 0) {
      for (const child of tag.children) {
        result.push(child);
      }
    }
  }
  return result;
}

export function ActionConfigurator({
  actionType,
  actionConfig,
  onActionTypeChange,
  onConfigChange,
  availableTags,
}: ActionConfiguratorProps) {
  function handleTypeChange(type: ActionType) {
    onActionTypeChange(type);
    if (type === 'create_record') {
      onConfigChange(DEFAULT_CREATE_RECORD);
    } else if (type === 'add_tags') {
      onConfigChange(DEFAULT_ADD_TAGS);
    } else {
      onConfigChange(DEFAULT_NOTIFICATION);
    }
  }

  const allTags = availableTags ? flattenTags(availableTags) : [];

  function toggleActionTag(tagId: string) {
    if (!isAddTagsConfig(actionConfig, actionType)) return;
    const current = actionConfig.tag_ids;
    if (current.includes(tagId)) {
      onConfigChange({ tag_ids: current.filter((id) => id !== tagId) });
    } else {
      onConfigChange({ tag_ids: [...current, tagId] });
    }
  }

  const selectedLabel = ACTION_OPTIONS.find((o) => o.value === actionType)?.label;

  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="bg-muted text-foreground hover:bg-state-hover inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
          >
            {selectedLabel ?? 'アクションを選択'}
            <ChevronDown className="text-muted-foreground size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {ACTION_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onSelect={() => handleTypeChange(opt.value)}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isCreateRecordConfig(actionConfig, actionType) && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="copy_time"
              checked={actionConfig.copy_time}
              onCheckedChange={(checked) =>
                onConfigChange({ ...actionConfig, copy_time: checked === true })
              }
            />
            <Label htmlFor="copy_time" className="font-normal">
              プランの時間をコピー
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="copy_tags"
              checked={actionConfig.copy_tags}
              onCheckedChange={(checked) =>
                onConfigChange({ ...actionConfig, copy_tags: checked === true })
              }
            />
            <Label htmlFor="copy_tags" className="font-normal">
              プランのタグをコピー
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fulfillment_score">デフォルトの達成度スコア（任意）</Label>
            <Select
              value={actionConfig.default_fulfillment_score?.toString() ?? 'none'}
              onValueChange={(v) => {
                const base: CreateRecordConfig = {
                  copy_time: actionConfig.copy_time,
                  copy_tags: actionConfig.copy_tags,
                };
                if (v !== 'none') {
                  base.default_fulfillment_score = Number(v) as 1 | 2 | 3 | 4 | 5;
                }
                onConfigChange(base);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isSendNotificationConfig(actionConfig, actionType) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="notification_title">通知タイトル</Label>
            <Input
              id="notification_title"
              value={actionConfig.title}
              onChange={(e) => onConfigChange({ ...actionConfig, title: e.target.value })}
              placeholder="例: プラン完了"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notification_message">メッセージ</Label>
            <Input
              id="notification_message"
              value={actionConfig.message}
              onChange={(e) => onConfigChange({ ...actionConfig, message: e.target.value })}
              placeholder="例: {{plan.title}} を完了しました！"
            />
          </div>
        </div>
      )}

      {isAddTagsConfig(actionConfig, actionType) && (
        <div className="flex flex-col gap-2">
          <Label>付与するタグ</Label>
          <div className="flex flex-col gap-2">
            {allTags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 ${tag.parent_id ? 'pl-6' : ''}`}
              >
                <Checkbox
                  id={`action_tag_${tag.id}`}
                  checked={actionConfig.tag_ids.includes(tag.id)}
                  onCheckedChange={() => toggleActionTag(tag.id)}
                />
                <Label htmlFor={`action_tag_${tag.id}`} className="cursor-pointer font-normal">
                  {tag.name}
                </Label>
              </div>
            ))}
            {allTags.length === 0 && (
              <p className="text-muted-foreground text-sm">タグがありません</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
