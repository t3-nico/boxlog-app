import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Reflection } from '../types';

import { ReflectionPanel } from './ReflectionPanel';

const meta = {
  title: 'Draft/Reflection/ReflectionPanel',
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

// 過去の Reflection モックデータ（リスト表示用）
const MOCK_REFLECTIONS: Reflection[] = [
  MOCK_REFLECTION,
  {
    id: 'ref-2',
    date: '2026-02-16',
    title: 'ゆっくり過ごした休日',
    activities: [{ label: '読書', duration: 60, type: 'record' }],
    insights: '休息も大切な時間です。',
    question: '休日にリフレッシュできましたか？',
    userNote: '',
    createdAt: '2026-02-16T21:00:00Z',
    updatedAt: '2026-02-16T21:00:00Z',
  },
  {
    id: 'ref-3',
    date: '2026-02-14',
    title: '週の締めくくり',
    activities: [
      { label: 'コードレビュー', duration: 120, type: 'record' },
      { label: 'ドキュメント作成', duration: 90, type: 'record' },
    ],
    insights: '週末に向けてタスクを整理できました。',
    question: '今週の一番の学びは何でしたか？',
    userNote: '',
    createdAt: '2026-02-14T21:00:00Z',
    updatedAt: '2026-02-14T21:00:00Z',
  },
  {
    id: 'ref-4',
    date: '2026-02-10',
    title: '新機能の設計に集中',
    activities: [
      { label: '設計', duration: 180, type: 'record' },
      { label: 'プロトタイピング', duration: 120, type: 'record' },
    ],
    insights: 'プロトタイプの完成度が高かった一日。',
    question: '設計段階で一番意識したことは？',
    userNote: '',
    createdAt: '2026-02-10T21:00:00Z',
    updatedAt: '2026-02-10T21:00:00Z',
  },
  {
    id: 'ref-5',
    date: '2026-02-03',
    title: 'チームコラボレーションの日',
    activities: [
      { label: 'ペアプログラミング', duration: 240, type: 'record' },
      { label: 'チームMTG', duration: 60, type: 'record' },
    ],
    insights: 'ペアプロで新しい視点を得られた。',
    question: '次にペアプロしたい相手は？',
    userNote: '',
    createdAt: '2026-02-03T21:00:00Z',
    updatedAt: '2026-02-03T21:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function PanelFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[600px] w-[320px] border">{children}</div>;
}

// ---------------------------------------------------------------------------
// Stories: 詳細ビュー（単一 Reflection）
// ---------------------------------------------------------------------------

/** 未生成状態（空リスト） */
export const Empty: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflections={[]} onGenerate={() => {}} />
    </PanelFrame>
  ),
};

/** 生成中（ストリーミング中） */
export const Loading: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflections={[]} isLoading />
    </PanelFrame>
  ),
};

/** 1件のみ → リストに1件表示 */
export const SingleItem: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflections={[MOCK_REFLECTION]} onUserNoteChange={() => {}} />
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
          reflections={[{ ...MOCK_REFLECTION_WITH_NOTE, userNote: note }]}
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
      <ReflectionPanel reflections={[MOCK_REFLECTION_LONG]} onUserNoteChange={() => {}} />
    </PanelFrame>
  ),
};

// ---------------------------------------------------------------------------
// Stories: リストビュー
// ---------------------------------------------------------------------------

/** 複数件のリスト表示（週グループ付き） */
export const List: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflections={MOCK_REFLECTIONS} onGenerate={() => {}} />
    </PanelFrame>
  ),
};

/** リストが空の状態 */
export const ListEmpty: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel reflections={[]} onGenerate={() => {}} />
    </PanelFrame>
  ),
};

/** リストからクリックで詳細に遷移（インタラクティブ） */
export const ListToDetail: Story = {
  render: () => (
    <PanelFrame>
      <ReflectionPanel
        reflections={MOCK_REFLECTIONS}
        onGenerate={() => {}}
        onUserNoteChange={() => {}}
      />
    </PanelFrame>
  ),
};

// ---------------------------------------------------------------------------
// Stories: 全パターン一覧
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Empty</p>
        <PanelFrame>
          <ReflectionPanel reflections={[]} onGenerate={() => {}} />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Loading</p>
        <PanelFrame>
          <ReflectionPanel reflections={[]} isLoading />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">List</p>
        <PanelFrame>
          <ReflectionPanel reflections={MOCK_REFLECTIONS} onGenerate={() => {}} />
        </PanelFrame>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs">Single Item</p>
        <PanelFrame>
          <ReflectionPanel reflections={[MOCK_REFLECTION]} onUserNoteChange={() => {}} />
        </PanelFrame>
      </div>
    </div>
  ),
};
