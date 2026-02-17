import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  MOCK_LONG_CONVERSATION,
  MOCK_MARKDOWN_MESSAGES,
  MOCK_MESSAGES,
  MOCK_TOOL_MESSAGES,
} from './__mocks__/chatMockData';
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

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 短い会話 */
export const Default: Story = {};

/** 長い会話（スクロール確認用） */
export const LongConversation: Story = {
  args: {
    messages: MOCK_LONG_CONVERSATION,
  },
};

/** Markdown描画 */
export const WithMarkdown: Story = {
  args: {
    messages: MOCK_MARKDOWN_MESSAGES,
  },
};

/** ツール呼び出し付き */
export const WithToolInvocations: Story = {
  args: {
    messages: MOCK_TOOL_MESSAGES,
  },
};

/** コピーボタン確認（assistantメッセージにホバーで表示） */
export const WithCopyButton: Story = {
  args: {
    messages: MOCK_MARKDOWN_MESSAGES,
  },
  parameters: {
    docs: {
      description: {
        story: 'Assistantメッセージにホバーするとコピーボタンが表示されます。',
      },
    },
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
        <ChatMessageList messages={MOCK_MESSAGES} />
      </div>
      <div className="border-border h-[500px] w-[320px] border">
        <ChatMessageList messages={MOCK_MARKDOWN_MESSAGES} />
      </div>
      <div className="border-border h-[500px] w-[320px] border">
        <ChatMessageList messages={MOCK_TOOL_MESSAGES} />
      </div>
    </div>
  ),
};
