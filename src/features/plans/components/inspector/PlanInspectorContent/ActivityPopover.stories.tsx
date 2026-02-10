'use client';

import {
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Repeat,
  Tag,
  Trash,
} from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/react';

import { cn } from '@/lib/utils';

import type { ActivityIconColor, PlanActivity, PlanActivityDisplay } from '../../../types/activity';
import { formatActivity } from '../../../utils/activityFormatter';

/** ActivityPopover - Plan変更履歴タイムライン */
const meta = {
  title: 'Features/Plans/ActivityPopover',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Inspectorヘッダーの History アイコンから開く Popover。',
          'アクティビティを時系列で表示（新しい順）。',
          'GAFA基準: 「意思決定」を伴う変更のみ表示。',
          '',
          'アイコン色の詳細は **IconColorReference** Story を参照。',
          '',
          '**使用箇所:** PlanInspectorContent ヘッダー',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────

const now = new Date();

function minutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const baseMock = {
  plan_id: 'mock-plan-id',
  user_id: 'mock-user-id',
  field_name: null,
  old_value: null,
  new_value: null,
  metadata: null,
} as const;

const mockActivities: PlanActivity[] = [
  {
    ...baseMock,
    id: '1',
    action_type: 'tag_added',
    new_value: 'Work',
    created_at: minutesAgo(5),
  },
  {
    ...baseMock,
    id: '2',
    action_type: 'time_changed',
    old_value: '09:00 - 10:00',
    new_value: '10:00 - 11:30',
    created_at: minutesAgo(30),
  },
  {
    ...baseMock,
    id: '3',
    action_type: 'status_changed',
    old_value: 'open',
    new_value: 'closed',
    created_at: hoursAgo(2),
  },
  {
    ...baseMock,
    id: '4',
    action_type: 'title_changed',
    old_value: 'デザインレビュー',
    new_value: 'デザインレビュー v2',
    created_at: hoursAgo(5),
  },
  {
    ...baseMock,
    id: '5',
    action_type: 'due_date_changed',
    old_value: '2026-02-10',
    new_value: '2026-02-15',
    created_at: daysAgo(1),
  },
  {
    ...baseMock,
    id: '6',
    action_type: 'recurrence_changed',
    new_value: '毎週月曜日',
    created_at: daysAgo(2),
  },
  {
    ...baseMock,
    id: '7',
    action_type: 'reminder_changed',
    new_value: '10分前',
    created_at: daysAgo(3),
  },
  {
    ...baseMock,
    id: '8',
    action_type: 'tag_removed',
    old_value: 'Personal',
    created_at: daysAgo(4),
  },
  {
    ...baseMock,
    id: '9',
    action_type: 'created',
    created_at: daysAgo(5),
  },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function getActivityIcon(icon: PlanActivityDisplay['icon']) {
  switch (icon) {
    case 'create':
      return Plus;
    case 'update':
      return Edit;
    case 'status':
      return CheckCircle;
    case 'tag':
      return Tag;
    case 'delete':
      return Trash;
    case 'time':
      return Clock;
    case 'due_date':
      return CalendarDays;
    case 'recurrence':
      return Repeat;
    case 'reminder':
      return Bell;
    default:
      return Edit;
  }
}

function getIconColor(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'text-success';
    case 'info':
      return 'text-info';
    case 'warning':
      return 'text-warning';
    case 'primary':
      return 'text-primary';
    case 'destructive':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function formatMockTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  return `${diffDays}日前`;
}

function ActivityTimeline({ activities }: { activities: PlanActivity[] }) {
  return (
    <div className="w-80 rounded-lg border">
      <div className="px-4 py-4">
        <h3 className="text-sm font-bold">アクティビティ</h3>
      </div>
      <div className="max-h-96 overflow-y-auto px-4 py-4">
        {activities.map((activity, index) => {
          const formatted = formatActivity(activity);
          const IconComponent = getActivityIcon(formatted.icon);
          const isLast = index === activities.length - 1;

          return (
            <div key={activity.id} className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'bg-muted relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full',
                  )}
                >
                  <IconComponent className={cn('size-4', getIconColor(formatted.iconColor))} />
                </div>
                {!isLast && (
                  <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm leading-8 font-bold">{formatted.actionLabel}</span>
                  <span className="text-muted-foreground mt-2 flex-shrink-0 text-xs">
                    {formatMockTime(activity.created_at)}
                  </span>
                </div>
                {formatted.detail && (
                  <p className="text-muted-foreground -mt-1 text-xs">{formatted.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** アイコン色リファレンス用データ */
const iconReferenceItems: {
  icon: PlanActivityDisplay['icon'];
  color: ActivityIconColor;
  token: string;
  label: string;
  actions: string;
}[] = [
  { icon: 'create', color: 'success', token: 'text-success', label: 'Success', actions: '作成' },
  {
    icon: 'status',
    color: 'warning',
    token: 'text-warning',
    label: 'Warning',
    actions: 'ステータス変更',
  },
  {
    icon: 'time',
    color: 'info',
    token: 'text-info',
    label: 'Info',
    actions: 'タイトル / 時間 / 期限 / 繰り返し / 通知',
  },
  {
    icon: 'tag',
    color: 'primary',
    token: 'text-primary',
    label: 'Primary',
    actions: 'タグ追加 / 削除',
  },
  {
    icon: 'delete',
    color: 'destructive',
    token: 'text-destructive',
    label: 'Destructive',
    actions: '削除',
  },
];

function IconReference() {
  return (
    <div className="w-[480px] rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-bold">アイコン色リファレンス</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          背景は全て bg-muted（統一）。色の差別化はアイコン色のみ。
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="text-muted-foreground px-4 py-2 text-xs font-medium">Icon</th>
            <th className="text-muted-foreground px-4 py-2 text-xs font-medium">Token</th>
            <th className="text-muted-foreground px-4 py-2 text-xs font-medium">用途</th>
          </tr>
        </thead>
        <tbody>
          {iconReferenceItems.map((item) => {
            const IconComponent = getActivityIcon(item.icon);
            return (
              <tr key={item.token} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                      <IconComponent className={cn('size-4', getIconColor(item.color))} />
                    </div>
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{item.token}</code>
                </td>
                <td className="text-muted-foreground px-4 py-3 text-xs">{item.actions}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div className="w-80 rounded-lg border">
      <div className="px-4 py-4">
        <h3 className="text-sm font-bold">アクティビティ</h3>
      </div>
      <div className="text-muted-foreground px-4 py-8 text-center text-sm">
        アクティビティはありません
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** タイムライン（全アクション種別） */
export const Timeline: Story = {
  render: () => <ActivityTimeline activities={mockActivities} />,
};

/** 空状態 */
export const Empty: Story = {
  render: () => <EmptyTimeline />,
};

/** アイコン色リファレンス */
export const IconColorReference: Story = {
  render: () => <IconReference />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <IconReference />
      <ActivityTimeline activities={mockActivities} />
      <EmptyTimeline />
    </div>
  ),
};
