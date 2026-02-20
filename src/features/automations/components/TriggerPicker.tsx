'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

import type { ConditionField } from '../types';

const FIELD_OPTIONS: { value: ConditionField; label: string }[] = [
  { value: 'status', label: 'ステータス' },
  { value: 'tagIds', label: 'タグ' },
  { value: 'fulfillment', label: '充実度' },
  { value: 'duration', label: '所要時間' },
  { value: 'timeRange', label: '時間帯' },
  { value: 'title', label: 'タイトル' },
  { value: 'recurrence', label: '繰り返し' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'オープン' },
  { value: 'closed', label: 'クローズ' },
];

const COMPARISON_OPERATOR_OPTIONS = [
  { value: 'gte', label: '以上' },
  { value: 'lte', label: '以下' },
  { value: 'equals', label: '等しい' },
];

const DURATION_OPERATOR_OPTIONS = [
  { value: 'gte', label: '以上' },
  { value: 'lte', label: '以下' },
];

const FULFILLMENT_SCORE_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
];

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

/** "gte:3" → { operator: "gte", score: "3" } */
function parseFulfillmentValue(value: string): {
  operator: string;
  score: string;
} {
  const [operator, score] = value.split(':');
  return { operator: operator || 'gte', score: score || '3' };
}

/** "gte:60" → { operator: "gte", minutes: "60" } */
function parseDurationValue(value: string): {
  operator: string;
  minutes: string;
} {
  const [operator, minutes] = value.split(':');
  return { operator: operator || 'gte', minutes: minutes || '60' };
}

/** "09:00-18:00" → { start: "09:00", end: "18:00" } */
function parseTimeRangeValue(value: string): { start: string; end: string } {
  const [start, end] = value.split('-');
  return { start: start || '09:00', end: end || '18:00' };
}

interface TriggerPickerProps {
  field: ConditionField | undefined;
  /** status / title / fulfillment / duration / timeRange / recurrence 用の値 */
  value: string;
  /** tagIds 用の選択済みID */
  selectedTagIds: string[];
  onFieldChange: (field: ConditionField) => void;
  onValueChange: (value: string) => void;
  onTagIdsChange: (ids: string[]) => void;
  /** Storybook用: タグ一覧を注入 */
  availableTags?: Tag[] | undefined;
}

export function TriggerPicker({
  field,
  value,
  selectedTagIds,
  onFieldChange,
  onValueChange,
  onTagIdsChange,
  availableTags,
}: TriggerPickerProps) {
  const t = useTranslations();
  const selectedLabel = FIELD_OPTIONS.find((o) => o.value === field)?.label;

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onTagIdsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagIdsChange([...selectedTagIds, tagId]);
    }
  }

  const allTags = availableTags ? flattenTags(availableTags) : [];

  const fulfillment = parseFulfillmentValue(value);
  const duration = parseDurationValue(value);
  const timeRange = parseTimeRangeValue(value);

  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="bg-muted text-foreground hover:bg-state-hover inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
          >
            {selectedLabel ?? 'きっかけを選択'}
            <ChevronDown className="text-muted-foreground size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {FIELD_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => {
                onFieldChange(opt.value);
                onValueChange('');
                onTagIdsChange([]);
              }}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {field === 'status' && (
        <div className="flex flex-col gap-2">
          <Label>ステータスが次に変わったとき</Label>
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ステータスを選択..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {field === 'tagIds' && (
        <div className="flex flex-col gap-2">
          <Label>対象のタグ</Label>
          <div className="flex flex-col gap-2">
            {allTags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 ${tag.parent_id ? 'pl-6' : ''}`}
              >
                <Checkbox
                  id={`tag_${tag.id}`}
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <Label htmlFor={`tag_${tag.id}`} className="cursor-pointer font-normal">
                  {tag.icon ? `${tag.icon} ` : ''}
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

      {field === 'fulfillment' && (
        <div className="flex flex-col gap-2">
          <Label>充実度スコア</Label>
          <div className="flex items-center gap-2">
            <Select
              value={fulfillment.operator}
              onValueChange={(op) => onValueChange(`${op}:${fulfillment.score}`)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_OPERATOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={fulfillment.score}
              onValueChange={(score) => onValueChange(`${fulfillment.operator}:${score}`)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FULFILLMENT_SCORE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {field === 'duration' && (
        <div className="flex flex-col gap-2">
          <Label>所要時間</Label>
          <div className="flex items-center gap-2">
            <Select
              value={duration.operator}
              onValueChange={(op) => onValueChange(`${op}:${duration.minutes}`)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPERATOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              value={duration.minutes}
              onChange={(e) => onValueChange(`${duration.operator}:${e.target.value}`)}
              className="w-20"
              aria-label="分数"
            />
            <span className="text-muted-foreground text-sm">分</span>
          </div>
        </div>
      )}

      {field === 'timeRange' && (
        <div className="flex flex-col gap-2">
          <Label>時間帯</Label>
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={timeRange.start}
              onChange={(e) => onValueChange(`${e.target.value}-${timeRange.end}`)}
              className="w-32"
              aria-label={t('common.aria.startTime')}
            />
            <span className="text-muted-foreground text-sm">〜</span>
            <Input
              type="time"
              value={timeRange.end}
              onChange={(e) => onValueChange(`${timeRange.start}-${e.target.value}`)}
              className="w-32"
              aria-label={t('common.aria.endTime')}
            />
          </div>
        </div>
      )}

      {field === 'title' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="trigger_title">タイトルに含まれるテキスト</Label>
          <Input
            id="trigger_title"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="例: 会議"
          />
        </div>
      )}

      {field === 'recurrence' && (
        <div className="flex flex-col gap-2">
          <Label>繰り返しパターン</Label>
          <Select value={value || 'none'} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="繰り返しを選択..." />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
