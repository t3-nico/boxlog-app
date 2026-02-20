import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { FulfillmentScore } from '@/features/records/types/record';

import { FulfillmentButton } from './FulfillmentButton';

/**
 * FulfillmentButton — 充実度スコア入力ボタン
 *
 * ## Props
 * - `score: FulfillmentScore | null` — 現在のスコア（1-5、null=未設定）
 * - `onScoreChange: (value: FulfillmentScore | null) => void` — 変更コールバック
 * - `disabled?: boolean` — 無効化
 *
 * ## インタラクション
 * - **タップ**: スコアを1ずつ加算（1→2→3→4→5、上限5）
 * - **長押し（500ms）**: リセット（null）
 *
 * ## 使用箇所
 * - **Record Inspector** — 既存Record編集（即座にDB保存）
 * - **RecordCreateForm** — Plan InspectorからのRecord新規作成（ドラフト）
 */
const meta = {
  title: 'Features/Plans/FulfillmentButton',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Interactive Wrapper
// ---------------------------------------------------------------------------

function FulfillmentButtonStory({
  initialScore = null,
  disabled = false,
}: {
  initialScore?: FulfillmentScore | null;
  disabled?: boolean;
}) {
  const [score, setScore] = useState<FulfillmentScore | null>(initialScore);
  return <FulfillmentButton score={score} onScoreChange={setScore} disabled={disabled} />;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** スコアなし — デフォルト状態 */
export const Default: Story = {
  render: () => <FulfillmentButtonStory />,
};

/** スコア3 — 中間値 */
export const WithScore: Story = {
  render: () => <FulfillmentButtonStory initialScore={3} />,
};

/** スコア5 — 最大値（タップしても増加しない） */
export const MaxScore: Story = {
  render: () => <FulfillmentButtonStory initialScore={5} />,
};

/** 無効化状態 */
export const Disabled: Story = {
  render: () => <FulfillmentButtonStory initialScore={3} disabled />,
};

/** 全状態一覧 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: null (empty)</p>
        <FulfillmentButtonStory />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: 1</p>
        <FulfillmentButtonStory initialScore={1} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: 2</p>
        <FulfillmentButtonStory initialScore={2} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: 3</p>
        <FulfillmentButtonStory initialScore={3} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: 4</p>
        <FulfillmentButtonStory initialScore={4} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Score: 5 (max)</p>
        <FulfillmentButtonStory initialScore={5} />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Disabled</p>
        <FulfillmentButtonStory initialScore={3} disabled />
      </div>
    </div>
  ),
};
