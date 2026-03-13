import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Switch } from '@/components/ui/switch';

import { LabeledRow } from './LabeledRow';

const meta = {
  title: 'Components/Common/LabeledRow',
  component: LabeledRow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LabeledRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ラベルのみ。 */
export const Default: Story = {
  args: {
    label: 'Notifications',
    children: <Switch />,
  },
};

/** ラベル + 説明文。 */
export const WithDescription: Story = {
  args: {
    label: 'Dark mode',
    description: 'Use dark theme across the app',
    children: <Switch />,
  },
};

/** 複数行を並べた設定画面パターン。 */
export const AllPatterns: StoryObj = {
  render: () => (
    <div className="divide-border divide-y">
      <LabeledRow label="Notifications">
        <Switch />
      </LabeledRow>
      <LabeledRow label="Dark mode" description="Use dark theme across the app">
        <Switch />
      </LabeledRow>
      <LabeledRow label="Language">
        <span className="text-muted-foreground text-sm">English</span>
      </LabeledRow>
    </div>
  ),
};
