import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Reflection } from '../types';

import { ReflectionPanel } from './ReflectionPanel';

const meta = {
  title: 'Features/Reflection/ReflectionPanel',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

const MOCK_REFLECTION: Reflection = {
  id: 'ref-1',
  date: '2026-02-17',
  title: '集中力が冴えた月曜日',
  activities: [
    { label: 'デザイン作業', duration: 150, type: 'record' },
    { label: 'コーディング', duration: 240, type: 'record' },
    { label: 'ミーティング', duration: 60, type: 'record' },
    { label: 'タスク完了', count: 3, type: 'plan' },
  ],
  insights:
    '今日はコーディングに集中できた素晴らしい一日でした。特にデザインからコードへの移行がスムーズで、**4時間**のディープワークを達成しています。\n\nミーティングも1時間に収まり、残りの時間を有効活用できました。',
  question: '今日一番達成感があったのはどの作業ですか？',
  userNote: '',
  createdAt: '2026-02-17T21:00:00Z',
  updatedAt: '2026-02-17T21:00:00Z',
};

const MOCK_REFLECTION_WITH_NOTE: Reflection = {
  ...MOCK_REFLECTION,
  userNote:
    'デザインからコードへの移行がスムーズだったのは、Figmaで先にコンポーネント設計を固めたおかげ。この流れを来週も続けたい。',
};

const MOCK_REFLECTION_LONG: Reflection = {
  ...MOCK_REFLECTION,
  title: 'プロジェクトの大きなマイルストーンを達成した充実の一日',
  activities: [
    { label: 'フロントエンド開発', duration: 180, type: 'record' },
    { label: 'バックエンド開発', duration: 120, type: 'record' },
    { label: 'コードレビュー', duration: 45, type: 'record' },
    { label: 'テスト作成', duration: 90, type: 'record' },
    { label: 'ドキュメント整理', duration: 30, type: 'record' },
    { label: 'チームMTG', duration: 60, type: 'record' },
    { label: '1on1', duration: 30, type: 'record' },
    { label: 'タスク完了', count: 7, type: 'plan' },
  ],
  insights:
    '## ハイライト\n\n今日は**フルスタック開発**に取り組んだ充実の一日でした。\n\n### フロントエンド\n- ReflectionパネルのUIを完成\n- Storybookで全状態を網羅\n- アクセシビリティチェック済み\n\n### バックエンド\n- tRPCエンドポイントの設計\n- Zodバリデーションの整備\n\n### その他\nコードレビューでチームメンバーの成長を実感。テストカバレッジも向上しました。',
  question:
    'フロントエンドとバックエンドの両方に取り組む日と、どちらかに集中する日、あなたはどちらが生産性が高いと感じますか？',
};

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function PanelFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[600px] w-[320px] border">{children}</div>;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 未生成状態（生成ボタンあり） */
export const Empty: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflection={null} onGenerate={() => {}} />
    </PanelFrame>
  ),
};

/** 生成中（ストリーミング中） */
export const Loading: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflection={null} isLoading />
    </PanelFrame>
  ),
};

/** 生成済み状態（全セクション表示） */
export const Generated: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflection={MOCK_REFLECTION} onUserNoteChange={() => {}} />
    </PanelFrame>
  ),
};

/** ユーザーメモ入力済み */
export const WithUserNote: Story = {
  render: () => {
    const [note, setNote] = useState(MOCK_REFLECTION_WITH_NOTE.userNote);
    return (
      <PanelFrame>
        <ReflectionPanel
          reflection={{ ...MOCK_REFLECTION_WITH_NOTE, userNote: note }}
          onUserNoteChange={setNote}
        />
      </PanelFrame>
    );
  },
};

/** アクティビティが多い場合 */
export const ManyActivities: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflection={MOCK_REFLECTION_LONG} onUserNoteChange={() => {}} />
    </PanelFrame>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Empty</p>
        <PanelFrame>
          <ReflectionPanel reflection={null} onGenerate={() => {}} />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Loading</p>
        <PanelFrame>
          <ReflectionPanel reflection={null} isLoading />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Generated</p>
        <PanelFrame>
          <ReflectionPanel reflection={MOCK_REFLECTION} onUserNoteChange={() => {}} />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">With Note</p>
        <PanelFrame>
          <ReflectionPanel reflection={MOCK_REFLECTION_WITH_NOTE} onUserNoteChange={() => {}} />
        </PanelFrame>
      </div>
    </div>
  ),
};
