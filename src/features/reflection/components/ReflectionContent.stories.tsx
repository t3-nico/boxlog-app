import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Reflection } from '../types';

import { ReflectionContent } from './ReflectionContent';

const meta = {
  title: 'Draft/Reflection/ReflectionContent',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

const BASE_REFLECTION: Reflection = {
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
    '今日はコーディングに集中できた素晴らしい一日でした。特にデザインからコードへの移行がスムーズで、**4時間**のディープワークを達成しています。',
  question: '今日一番達成感があったのはどの作業ですか？',
  userNote: '',
  createdAt: '2026-02-17T21:00:00Z',
  updatedAt: '2026-02-17T21:00:00Z',
};

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function ContentFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border w-[320px] border">{children}</div>;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 標準的な日報 */
export const Default: Story = {
  render: () => (
    <ContentFrame>
      <ReflectionContent reflection={BASE_REFLECTION} onUserNoteChange={() => {}} />
    </ContentFrame>
  ),
};

/** 長い所感テキスト */
export const LongInsights: Story = {
  render: () => (
    <ContentFrame>
      <ReflectionContent
        reflection={{
          ...BASE_REFLECTION,
          insights:
            '## 今日のハイライト\n\n今日は非常に生産性の高い一日でした。\n\n### 午前中\n- デザインレビューを完了し、フィードバックを反映\n- コンポーネントの設計を固めてから実装に着手\n\n### 午後\n- 4時間の集中コーディングセッション\n- テストカバレッジを80%まで向上\n\n### 振り返り\n\nデザインからコードへの移行が特にスムーズだった理由を分析すると:\n\n1. **事前のコンポーネント設計**: Figmaで先にUI構造を固めた\n2. **型安全性の活用**: TypeScriptの型推論が実装をガイド\n3. **既存パターンの再利用**: Storybookで確認済みのパターンを活用\n\n> 「Good architecture is about making decisions easy to change.」\n\nこの原則を意識して開発を進められた一日でした。',
        }}
        onUserNoteChange={() => {}}
      />
    </ContentFrame>
  ),
};

/** アクティビティが多い場合 */
export const ManyActivities: Story = {
  render: () => (
    <ContentFrame>
      <ReflectionContent
        reflection={{
          ...BASE_REFLECTION,
          activities: [
            { label: 'フロントエンド開発', duration: 180, type: 'record' },
            { label: 'バックエンド開発', duration: 120, type: 'record' },
            { label: 'コードレビュー', duration: 45, type: 'record' },
            { label: 'テスト作成', duration: 90, type: 'record' },
            { label: 'ドキュメント整理', duration: 30, type: 'record' },
            { label: 'チームMTG', duration: 60, type: 'record' },
            { label: '1on1', duration: 30, type: 'record' },
            { label: 'ランチ', duration: 60, type: 'record' },
            { label: 'タスク完了', count: 7, type: 'plan' },
            { label: '新規タスク作成', count: 3, type: 'plan' },
          ],
        }}
        onUserNoteChange={() => {}}
      />
    </ContentFrame>
  ),
};
