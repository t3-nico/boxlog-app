import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { TourStepCard } from './TourStepCard';

/** TourStepCard — ツアーステップの共通コンテンツカード */
const meta = {
  title: 'Features/Tour/TourStepCard',
  component: TourStepCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    titleKey: 'tour.steps.gridDrag.title',
    descriptionKey: 'tour.steps.gridDrag.description',
    currentStep: 1,
    totalSteps: 3,
    isLastStep: false,
    onNext: fn(),
    onSkip: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TourStepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 1: ドラッグで作成 */
export const Step1GridDrag: Story = {};

/** Step 2: クリックで確認 */
export const Step2ClickEntry: Story = {
  args: {
    titleKey: 'tour.steps.clickEntry.title',
    descriptionKey: 'tour.steps.clickEntry.description',
    currentStep: 2,
    totalSteps: 3,
  },
};

/** Step 3: 予定と記録の違い（最後のステップ） */
export const Step3PlanVsRecord: Story = {
  args: {
    titleKey: 'tour.steps.planVsRecord.title',
    descriptionKey: 'tour.steps.planVsRecord.description',
    currentStep: 3,
    totalSteps: 3,
    isLastStep: true,
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div style={{ width: 280 }}>
        <p className="text-muted-foreground mb-2 text-xs">Step 1/3 — Grid Drag</p>
        <TourStepCard
          titleKey="tour.steps.gridDrag.title"
          descriptionKey="tour.steps.gridDrag.description"
          currentStep={1}
          totalSteps={3}
          isLastStep={false}
          onNext={fn()}
          onSkip={fn()}
        />
      </div>
      <div style={{ width: 280 }}>
        <p className="text-muted-foreground mb-2 text-xs">Step 2/3 — Click Entry</p>
        <TourStepCard
          titleKey="tour.steps.clickEntry.title"
          descriptionKey="tour.steps.clickEntry.description"
          currentStep={2}
          totalSteps={3}
          isLastStep={false}
          onNext={fn()}
          onSkip={fn()}
        />
      </div>
      <div style={{ width: 280 }}>
        <p className="text-muted-foreground mb-2 text-xs">Step 3/3 — Plan vs Record</p>
        <TourStepCard
          titleKey="tour.steps.planVsRecord.title"
          descriptionKey="tour.steps.planVsRecord.description"
          currentStep={3}
          totalSteps={3}
          isLastStep={true}
          onNext={fn()}
          onSkip={fn()}
        />
      </div>
    </div>
  ),
};
