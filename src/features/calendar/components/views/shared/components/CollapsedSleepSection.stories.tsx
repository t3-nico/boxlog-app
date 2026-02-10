import type { Meta, StoryObj } from '@storybook/react';

import { CollapsedSleepSection } from './CollapsedSleepSection';

/** 折りたたまれた睡眠時間帯セクション。睡眠時間帯を1行に圧縮して表示。 */
const meta = {
  title: 'Features/Calendar/Views/CollapsedSleepSection',
  component: CollapsedSleepSection,
  args: {
    position: 'top',
    startHour: 0,
    endHour: 6,
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CollapsedSleepSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 上部配置（早朝 0:00-6:00）。 */
export const Top: Story = {
  args: {
    position: 'top',
    startHour: 0,
    endHour: 6,
  },
};

/** 下部配置（深夜 22:00-24:00）。 */
export const Bottom: Story = {
  args: {
    position: 'bottom',
    startHour: 22,
    endHour: 24,
  },
};

/** 週表示でのプラン数表示。日ごとに件数バッジ。 */
export const WithPlanCounts: Story = {
  args: {
    position: 'top',
    startHour: 0,
    endHour: 6,
    planCountsByDate: [2, 0, 1, 3, 0, 0, 1],
  },
};

/** 単一日でのプラン数表示。 */
export const SingleDay: Story = {
  args: {
    position: 'top',
    startHour: 0,
    endHour: 6,
    planCountsByDate: [3],
  },
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <CollapsedSleepSection position="top" startHour={0} endHour={6} />
      <CollapsedSleepSection position="bottom" startHour={22} endHour={24} />
      <CollapsedSleepSection
        position="top"
        startHour={0}
        endHour={6}
        planCountsByDate={[2, 0, 1, 3, 0, 0, 1]}
      />
      <CollapsedSleepSection position="top" startHour={0} endHour={6} planCountsByDate={[3]} />
    </div>
  ),
};
