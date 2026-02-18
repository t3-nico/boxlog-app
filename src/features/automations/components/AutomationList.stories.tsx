import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { Automation } from '../types';
import { AutomationList } from './AutomationList';

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: '完了時にレコードを自動作成',
    is_enabled: true,
    trigger_type: 'plan.status_changed',
    conditions: [{ field: 'status', operator: 'equals', value: 'closed' }],
    action_type: 'create_record',
    action_config: { copy_time: true, copy_tags: true },
    trigger_count: 42,
    last_triggered_at: '2026-02-11T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '新規プラン作成時に通知',
    is_enabled: false,
    trigger_type: 'plan.created',
    conditions: [],
    action_type: 'send_notification',
    action_config: {
      title: '新規プラン',
      message: '新しいプランが追加されました',
    },
    trigger_count: 7,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '3',
    name: '作業セッションを記録',
    is_enabled: true,
    trigger_type: 'plan.status_changed',
    conditions: [
      { field: 'status', operator: 'equals', value: 'closed' },
      { field: 'tagIds', operator: 'in', value: ['work', 'study'] },
    ],
    action_type: 'create_record',
    action_config: {
      copy_time: true,
      copy_tags: true,
      default_fulfillment_score: 3,
    },
    trigger_count: 18,
    last_triggered_at: '2026-02-10T15:30:00Z',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '4',
    name: '高充実度のレコード通知',
    is_enabled: true,
    trigger_type: 'record.created',
    conditions: [{ field: 'fulfillment', operator: 'gte', value: '4' }],
    action_type: 'send_notification',
    action_config: { title: '充実度', message: '充実した時間でした！' },
    trigger_count: 5,
    created_at: '2026-01-22T00:00:00Z',
  },
  {
    id: '5',
    name: '長時間タスク記録',
    is_enabled: true,
    trigger_type: 'record.created',
    conditions: [{ field: 'duration', operator: 'gte', value: '120' }],
    action_type: 'create_record',
    action_config: { copy_time: true, copy_tags: false },
    trigger_count: 3,
    created_at: '2026-01-25T00:00:00Z',
  },
  {
    id: '6',
    name: '業務時間帯のプラン完了',
    is_enabled: true,
    trigger_type: 'plan.status_changed',
    conditions: [{ field: 'timeRange', operator: 'between', value: '09:00-18:00' }],
    action_type: 'create_record',
    action_config: { copy_time: true, copy_tags: true },
    trigger_count: 12,
    created_at: '2026-01-28T00:00:00Z',
  },
  {
    id: '7',
    name: '毎日の繰り返しプラン完了時',
    is_enabled: false,
    trigger_type: 'plan.status_changed',
    conditions: [{ field: 'recurrence', operator: 'equals', value: 'daily' }],
    action_type: 'send_notification',
    action_config: { title: '日課完了', message: '日課を達成しました' },
    trigger_count: 30,
    created_at: '2026-01-30T00:00:00Z',
  },
  {
    id: '8',
    name: '業務時間帯にタグ付与',
    is_enabled: true,
    trigger_type: 'record.created',
    conditions: [{ field: 'timeRange', operator: 'between', value: '09:00-18:00' }],
    action_type: 'add_tags',
    action_config: { tag_ids: ['work'] },
    trigger_count: 15,
    last_triggered_at: '2026-02-12T09:30:00Z',
    created_at: '2026-02-01T00:00:00Z',
  },
];

const meta = {
  title: 'Draft/Automations/AutomationList',
  component: AutomationList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '> **Note:** このコンポーネントは開発中です。本番環境ではまだ使用されていません。\n\n自動化ルールの一覧表示。空状態の案内と新規ルール作成ボタンを含む。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onCreate: fn(),
  },
} satisfies Meta<typeof AutomationList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 複数ルールの一覧 */
export const Default: Story = {
  args: {
    automations: mockAutomations,
  },
};

/** 空状態 */
export const Empty: Story = {
  args: {
    automations: [],
  },
};

/** ルール1件のみ */
export const SingleRule: Story = {
  args: {
    automations: mockAutomations.slice(0, 1),
  },
};
