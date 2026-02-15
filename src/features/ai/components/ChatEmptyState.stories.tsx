import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DEFAULT_SUGGESTIONS } from './__mocks__/chatMockData';
import { ChatEmptyState } from './ChatEmptyState';

/** ChatEmptyState - AIチャット空状態（サジェストボタン表示） */
const meta = {
  title: 'Features/AI/ChatEmptyState',
  component: ChatEmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    suggestions: DEFAULT_SUGGESTIONS,
    onSuggestionClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="border-border h-[500px] w-[320px] border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** デフォルト表示 */
export const Default: Story = {};

/** サジェストなし */
export const NoSuggestions: Story = {
  args: {
    suggestions: [],
  },
};

// ---------------------------------------------------------------------------
// AllPatterns
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="border-border h-[500px] w-[320px] border">
        <ChatEmptyState suggestions={DEFAULT_SUGGESTIONS} onSuggestionClick={fn()} />
      </div>
      <div className="border-border h-[500px] w-[320px] border">
        <ChatEmptyState suggestions={[]} onSuggestionClick={fn()} />
      </div>
    </div>
  ),
};
