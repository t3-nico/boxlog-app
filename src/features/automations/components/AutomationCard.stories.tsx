import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { Automation } from '../types';
import { AutomationCard } from './AutomationCard';

const baseAutomation: Automation = {
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
};

const meta = {
  title: 'Draft/Automations/AutomationCard',
  component: AutomationCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '> **Note:** このコンポーネントは開発中です。本番環境ではまだ使用されていません。\n\n自動化ルール1件を表示するカード。トリガー・アクション・条件の要約と、有効/無効の切り替え・編集・削除操作を提供する。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof AutomationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 有効なルール（42回実行済み） */
export const Default: Story = {
  args: {
    automation: baseAutomation,
  },
};

/** 無効状態のルール */
export const Disabled: Story = {
  args: {
    automation: {
      ...baseAutomation,
      id: '2',
      name: '新規プラン作成時に通知',
      is_enabled: false,
      trigger_type: 'plan.created',
      action_type: 'send_notification',
      action_config: { title: '新規プラン', message: 'プランが作成されました' },
      trigger_count: 7,
    },
  },
};

/** 新規作成直後（実行回数0） */
export const NewRule: Story = {
  args: {
    automation: {
      ...baseAutomation,
      id: '3',
      name: '新しいルール',
      trigger_count: 0,
    },
  },
};

/** 通知アクションのバリアント */
export const NotificationAction: Story = {
  args: {
    automation: {
      ...baseAutomation,
      id: '4',
      name: '完了通知',
      action_type: 'send_notification',
      action_config: {
        title: 'お疲れさまです！',
        message: '{{plan.title}} を完了しました',
      },
      trigger_count: 15,
    },
  },
};
