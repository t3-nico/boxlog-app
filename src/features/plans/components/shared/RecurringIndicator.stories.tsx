import type { Meta, StoryObj } from '@storybook/react-vite';

import { RecurringIndicator, RecurringIndicatorFromFlag } from './RecurringIndicator';

/** RecurringIndicator - 繰り返しプラン表示アイコン */
const meta = {
  title: 'Features/Plans/RecurringIndicator',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// タイプ別
// ─────────────────────────────────────────────────────────

/** 毎日繰り返し */
export const Daily: Story = {
  render: () => <RecurringIndicator recurrenceType="daily" showTooltip />,
};

/** 毎週繰り返し */
export const Weekly: Story = {
  render: () => <RecurringIndicator recurrenceType="weekly" showTooltip />,
};

/** 毎月繰り返し */
export const Monthly: Story = {
  render: () => <RecurringIndicator recurrenceType="monthly" showTooltip />,
};

/** 毎年繰り返し */
export const Yearly: Story = {
  render: () => <RecurringIndicator recurrenceType="yearly" showTooltip />,
};

/** 平日繰り返し */
export const Weekdays: Story = {
  render: () => <RecurringIndicator recurrenceType="weekdays" showTooltip />,
};

// ─────────────────────────────────────────────────────────
// カスタムRRULE
// ─────────────────────────────────────────────────────────

/** カスタムRRULE（隔週 月・水・金） */
export const CustomRule: Story = {
  render: () => (
    <RecurringIndicator recurrenceRule="FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR" showTooltip />
  ),
};

// ─────────────────────────────────────────────────────────
// サイズ
// ─────────────────────────────────────────────────────────

/** サイズ比較（xs / sm / md） */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['xs', 'sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <RecurringIndicator recurrenceType="daily" size={size} />
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ─────────────────────────────────────────────────────────
// バリエーション
// ─────────────────────────────────────────────────────────

/** ツールチップなし（アイコンのみ） */
export const WithoutTooltip: Story = {
  render: () => <RecurringIndicator recurrenceType="weekly" />,
};

/** 繰り返し設定なし → 何も表示されない */
export const NoRecurrence: Story = {
  render: () => (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <RecurringIndicator recurrenceType={null} />
      <span>← recurrenceType=null: 非表示</span>
    </div>
  ),
};

/** RecurringIndicatorFromFlag（isRecurringフラグ版） */
export const FromFlag: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <RecurringIndicatorFromFlag isRecurring />
        <span className="text-muted-foreground text-xs">isRecurring=true</span>
      </div>
      <div className="flex items-center gap-2">
        <RecurringIndicatorFromFlag isRecurring={false} />
        <span className="text-muted-foreground text-xs">isRecurring=false (非表示)</span>
      </div>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────
// 全パターン一覧
// ─────────────────────────────────────────────────────────

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground mb-3 text-sm font-medium">繰り返しタイプ</h3>
        <div className="flex items-center gap-6">
          {['daily', 'weekly', 'monthly', 'yearly', 'weekdays'].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <RecurringIndicator recurrenceType={type} showTooltip />
              <span className="text-muted-foreground text-xs">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-medium">サイズ</h3>
        <div className="flex items-center gap-6">
          {(['xs', 'sm', 'md'] as const).map((size) => (
            <div key={size} className="flex items-center gap-2">
              <RecurringIndicator recurrenceType="daily" size={size} />
              <span className="text-muted-foreground text-xs">{size}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-medium">カスタムRRULE</h3>
        <div className="flex flex-col gap-2">
          {[
            'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
            'FREQ=MONTHLY;BYMONTHDAY=15',
            'FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1',
            'FREQ=DAILY;COUNT=10',
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2">
              <RecurringIndicator recurrenceRule={rule} showTooltip />
              <code className="text-muted-foreground text-xs">{rule}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
