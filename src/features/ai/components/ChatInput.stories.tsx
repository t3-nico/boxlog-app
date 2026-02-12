import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatInput } from './ChatInput';

/** ChatInput - AIチャット入力フォーム（内部stateで動作） */
const meta = {
  title: 'Features/AI/ChatInput',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function InteractiveChatInput({ isLoading = false }: { isLoading?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div className="border-border w-[320px] border">
      <ChatInput
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue('')}
        isLoading={isLoading}
        onStop={() => {}}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 空の入力フォーム */
export const Empty: Story = {
  render: () => <InteractiveChatInput />,
};

/** ストリーミング中（ローディング状態） */
export const Loading: Story = {
  render: () => <InteractiveChatInput isLoading />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <InteractiveChatInput />
      <InteractiveChatInput isLoading />
    </div>
  ),
};
