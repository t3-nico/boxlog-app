import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { LabeledRow } from './LabeledRow';
import { SectionCard } from './SectionCard';

const meta = {
  title: 'Components/Common/SectionCard',
  component: SectionCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** タイトル付きセクション。 */
export const Default: Story = {
  args: {
    title: 'General',
    children: (
      <div className="divide-border divide-y">
        <LabeledRow label="Notifications">
          <Switch aria-label="Notifications" />
        </LabeledRow>
        <LabeledRow label="Sound">
          <Switch aria-label="Sound" />
        </LabeledRow>
      </div>
    ),
  },
};

/** タイトル + アクションボタン付き。 */
export const WithActions: Story = {
  args: {
    title: 'Tags',
    actions: (
      <Button variant="outline" size="sm">
        Add tag
      </Button>
    ),
    children: <div className="text-muted-foreground py-4 text-center text-sm">No tags yet</div>,
  },
};

/** タイトルなし。 */
export const WithoutTitle: Story = {
  args: {
    children: (
      <div className="divide-border divide-y">
        <LabeledRow label="Email">
          <span className="text-muted-foreground text-sm">demo@dayopt.app</span>
        </LabeledRow>
      </div>
    ),
  },
};

/** 複数セクションを並べた設定画面パターン。 */
export const AllPatterns: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <SectionCard title="General">
        <div className="divide-border divide-y">
          <LabeledRow label="Notifications">
            <Switch aria-label="Notifications" />
          </LabeledRow>
          <LabeledRow label="Sound">
            <Switch aria-label="Sound" />
          </LabeledRow>
        </div>
      </SectionCard>
      <SectionCard
        title="Tags"
        actions={
          <Button variant="outline" size="sm">
            Add tag
          </Button>
        }
      >
        <div className="text-muted-foreground py-4 text-center text-sm">No tags yet</div>
      </SectionCard>
    </div>
  ),
};
