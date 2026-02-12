import type { Meta, StoryObj } from '@storybook/react-vite';

import { MOCK_LONG_CONVERSATION, MOCK_MESSAGES } from './__mocks__/chatMockData';
import { ChatMessageList } from './ChatMessageList';

/** ChatMessageList - AIチャットメッセージ一覧 */
const meta = {
  title: 'Features/AI/ChatMessageList',
  component: ChatMessageList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    messages: MOCK_MESSAGES,
  },
  decorators: [
    (Story) => (
      <div className="border-border h-[500px] w-[320px] border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 短い会話 */
export const Default: Story = {};

/** 長い会話（スクロール確認用） */
export const LongConversation: Story = {
  args: {
    messages: MOCK_LONG_CONVERSATION,
  },
};
