import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StepIndicator } from './StepIndicator';

/** StepIndicator - 2ステップ進捗バー */
const meta = {
  title: 'Features/Onboarding/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** Step 1: Welcome */
export const Step1: Story = {
  args: {
    currentStep: 'welcome',
  },
};

/** Step 2: Chronotype */
export const Step2: Story = {
  args: {
    currentStep: 'chronotype',
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    currentStep: 'welcome',
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <StepIndicator currentStep="welcome" />
      <StepIndicator currentStep="chronotype" />
    </div>
  ),
};
