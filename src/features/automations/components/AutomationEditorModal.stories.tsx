import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button';
import type { Tag } from '@/core/types/tag';

import type { Automation } from '../types';
import { AutomationEditorModal } from './AutomationEditorModal';

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: '仕事',
    color: '#3b82f6',
    user_id: null,
    description: null,
    is_active: true,
    parent_id: null,
    created_at: null,
    updated_at: null,
    children: [
      {
        id: 'tag-1-1',
        name: 'ミーティング',
        color: '#3b82f6',
        user_id: null,
        description: null,
        is_active: true,
        parent_id: 'tag-1',
        created_at: null,
        updated_at: null,
      },
      {
        id: 'tag-1-2',
        name: 'コーディング',
        color: '#3b82f6',
        user_id: null,
        description: null,
        is_active: true,
        parent_id: 'tag-1',
        created_at: null,
        updated_at: null,
      },
    ],
  },
  {
    id: 'tag-2',
    name: '勉強',
    color: '#10b981',
    user_id: null,
    description: null,
    is_active: true,
    parent_id: null,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-3',
    name: '運動',
    color: '#f59e0b',
    user_id: null,
    description: null,
    is_active: true,
    parent_id: null,
    created_at: null,
    updated_at: null,
  },
  {
    id: 'tag-4',
    name: 'プライベート',
    color: '#ec4899',
    user_id: null,
    description: null,
    is_active: true,
    parent_id: null,
    created_at: null,
    updated_at: null,
  },
];

const statusTriggerAutomation: Automation = {
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

const tagTriggerAutomation: Automation = {
  id: '2',
  name: '仕事タグで通知',
  is_enabled: true,
  trigger_type: 'plan.status_changed',
  conditions: [{ field: 'tagIds', operator: 'in', value: ['tag-1', 'tag-2'] }],
  action_type: 'send_notification',
  action_config: {
    title: 'タグ検知',
    message: '対象のタグが付いたプランです',
  },
  trigger_count: 8,
  created_at: '2026-01-15T00:00:00Z',
};

const fulfillmentTriggerAutomation: Automation = {
  id: '3',
  name: '高充実度で通知',
  is_enabled: true,
  trigger_type: 'record.created',
  conditions: [{ field: 'fulfillment', operator: 'gte', value: '4' }],
  action_type: 'send_notification',
  action_config: { title: '充実度', message: '充実した時間でした！' },
  trigger_count: 5,
  created_at: '2026-01-20T00:00:00Z',
};

const durationTriggerAutomation: Automation = {
  id: '4',
  name: '長時間タスク通知',
  is_enabled: true,
  trigger_type: 'record.created',
  conditions: [{ field: 'duration', operator: 'gte', value: '120' }],
  action_type: 'send_notification',
  action_config: { title: '長時間', message: '2時間以上のタスクです' },
  trigger_count: 3,
  created_at: '2026-01-22T00:00:00Z',
};

const timeRangeTriggerAutomation: Automation = {
  id: '5',
  name: '業務時間内の記録',
  is_enabled: true,
  trigger_type: 'record.created',
  conditions: [{ field: 'timeRange', operator: 'between', value: '09:00-18:00' }],
  action_type: 'create_record',
  action_config: { copy_time: true, copy_tags: true },
  trigger_count: 12,
  created_at: '2026-01-25T00:00:00Z',
};

const recurrenceTriggerAutomation: Automation = {
  id: '6',
  name: '毎日の繰り返しプラン完了時',
  is_enabled: true,
  trigger_type: 'plan.status_changed',
  conditions: [{ field: 'recurrence', operator: 'equals', value: 'daily' }],
  action_type: 'create_record',
  action_config: { copy_time: true, copy_tags: true, default_fulfillment_score: 3 },
  trigger_count: 30,
  created_at: '2026-01-28T00:00:00Z',
};

const addTagsActionAutomation: Automation = {
  id: '7',
  name: '業務時間帯にタグ付与',
  is_enabled: true,
  trigger_type: 'record.created',
  conditions: [{ field: 'timeRange', operator: 'between', value: '09:00-18:00' }],
  action_type: 'add_tags',
  action_config: { tag_ids: ['tag-1'] },
  trigger_count: 15,
  last_triggered_at: '2026-02-12T09:30:00Z',
  created_at: '2026-02-01T00:00:00Z',
};

function CreateWrapper() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        エディターを開く
      </Button>
      <AutomationEditorModal
        open={open}
        onOpenChange={setOpen}
        onSave={fn()}
        availableTags={mockTags}
      />
    </>
  );
}

function EditWrapper({ automation }: { automation: Automation }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        エディターを開く
      </Button>
      <AutomationEditorModal
        open={open}
        onOpenChange={setOpen}
        automation={automation}
        onSave={fn()}
        availableTags={mockTags}
      />
    </>
  );
}

const meta = {
  title: 'Draft/Automations/AutomationEditorModal',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '> **Note:** このコンポーネントは開発中です。本番環境ではまだ使用されていません。\n\n自動化ルールの作成・編集モーダル。条件フィールド（7種）とアクション（レコード作成・通知送信・タグ付与）を設定できる。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 新規作成 — 空のフォーム */
export const CreateNew: Story = {
  render: () => <CreateWrapper />,
};

/** ステータスきっかけ + レコード作成 */
export const EditStatusTrigger: Story = {
  render: () => <EditWrapper automation={statusTriggerAutomation} />,
};

/** タグきっかけ + 通知送信（タグ一覧から選択） */
export const EditTagTrigger: Story = {
  render: () => <EditWrapper automation={tagTriggerAutomation} />,
};

/** 充実度きっかけ（4以上で通知） */
export const EditFulfillmentTrigger: Story = {
  render: () => <EditWrapper automation={fulfillmentTriggerAutomation} />,
};

/** 所要時間きっかけ（120分以上で通知） */
export const EditDurationTrigger: Story = {
  render: () => <EditWrapper automation={durationTriggerAutomation} />,
};

/** 時間帯きっかけ（09:00〜18:00） */
export const EditTimeRangeTrigger: Story = {
  render: () => <EditWrapper automation={timeRangeTriggerAutomation} />,
};

/** 繰り返しきっかけ（毎日） */
export const EditRecurrenceTrigger: Story = {
  render: () => <EditWrapper automation={recurrenceTriggerAutomation} />,
};

/** タグ付与アクション（業務時間帯 → 仕事タグ付与） */
export const EditAddTagsAction: Story = {
  render: () => <EditWrapper automation={addTagsActionAutomation} />,
};
