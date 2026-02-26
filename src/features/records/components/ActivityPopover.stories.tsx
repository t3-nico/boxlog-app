import { Clock, Plus, Star, Tag, Trash } from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ActivityIconColor, RecordActivity, RecordActivityDisplay } from '../types/activity';
import { formatActivity } from '../utils/activityFormatter';

/** RecordActivityPopover - Record変更履歴タイムライン */
const meta = {
  title: 'Features/Records/ActivityPopover',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Inspectorヘッダーの History アイコンから開く Popover。',
          'アクティビティを時系列で表示（新しい順）。',
          '「意思決定」を伴う変更のみ表示。',
          '',
          'アイコン色の詳細は **IconColorReference** Story を参照。',
          '',
          '**使用箇所:** RecordInspector ヘッダー',
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
  record_id: 'mock-record-id',
  user_id: 'mock-user-id',
  field_name: null,
  old_value: null,
  new_value: null,
  metadata: null,
  schema_version: 1,
} as const;

const mockActivities: RecordActivity[] = [
  {
    ...baseMock,
    id: '1',
    action_type: 'fulfillment_changed',
    old_value: '3',
    new_value: '5',
    created_at: minutesAgo(10),
  },
  {
    ...baseMock,
    id: '2',
    action_type: 'tag_added',
    new_value: 'Deep Work',
    created_at: minutesAgo(45),
  },
  {
    ...baseMock,
    id: '3',
    action_type: 'time_changed',
    old_value: '14:00 - 15:00',
    new_value: '14:00 - 16:30',
    created_at: hoursAgo(1),
  },
  {
    ...baseMock,
    id: '4',
    action_type: 'title_changed',
    old_value: 'コーディング',
    new_value: 'フロントエンド実装',
    created_at: hoursAgo(3),
  },
  {
    ...baseMock,
    id: '5',
    action_type: 'description_changed',
    created_at: daysAgo(1),
  },
  {
    ...baseMock,
    id: '6',
    action_type: 'tag_removed',
    old_value: 'Meeting',
    created_at: daysAgo(2),
  },
  {
    ...baseMock,
    id: '7',
    action_type: 'created',
    created_at: daysAgo(3),
  },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function getActivityIcon(icon: RecordActivityDisplay['icon']) {
  switch (icon) {
    case 'create':
      return Plus;
    case 'tag':
      return Tag;
    case 'delete':
      return Trash;
    case 'time':
      return Clock;
    case 'fulfillment':
      return Star;
    default:
      return Clock;
  }
}

function getIconColor(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'text-success';
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

/** アイコンリファレンス用データ */
const iconReferenceItems: {
  icon: RecordActivityDisplay['icon'];
  iconColor: ActivityIconColor;
  label: string;
  actions: string;
}[] = [
  { icon: 'create', iconColor: 'success', label: 'Plus', actions: '作成' },
  { icon: 'fulfillment', iconColor: 'warning', label: 'Star', actions: '充実度変更' },
  { icon: 'time', iconColor: 'info', label: 'Clock', actions: 'タイトル / 時間 / メモ' },
  { icon: 'tag', iconColor: 'primary', label: 'Tag', actions: 'タグ追加' },
  { icon: 'tag', iconColor: 'destructive', label: 'Tag', actions: 'タグ削除' },
  { icon: 'delete', iconColor: 'destructive', label: 'Trash', actions: '削除' },
];

function IconReference() {
  return (
    <div className="w-[480px] rounded-lg border">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-bold">アイコンリファレンス</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          背景 bg-container。作成は緑、削除系は赤、その他は text-muted-foreground。
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="text-muted-foreground px-4 py-2 text-xs font-medium">Icon</th>
            <th className="text-muted-foreground px-4 py-2 text-xs font-medium">用途</th>
          </tr>
        </thead>
        <tbody>
          {iconReferenceItems.map((item, index) => {
            const IconComponent = getActivityIcon(item.icon);
            return (
              <tr key={`${item.icon}-${index}`} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-container flex size-8 items-center justify-center rounded-full">
                      <IconComponent className={`size-4 ${getIconColor(item.iconColor)}`} />
                    </div>
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                  </div>
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

function ActivityTimeline({ activities }: { activities: RecordActivity[] }) {
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
                <div className="bg-container relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
                  <IconComponent className={`size-4 ${getIconColor(formatted.iconColor)}`} />
                </div>
                {!isLast && (
                  <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm leading-8 font-bold">{formatted.actionLabelKey}</span>
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
