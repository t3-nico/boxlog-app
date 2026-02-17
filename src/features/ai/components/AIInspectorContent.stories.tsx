import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ChatMessage } from '../types';

import { MOCK_MESSAGES } from './__mocks__/chatMockData';
import { AIInspectorContent } from './AIInspectorContent';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';

/** AIInspectorContent - AIチャットパネル（内部stateで動作） */
const meta = {
  title: 'Features/AI/AIInspectorContent',
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

function PanelFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-border h-[500px] w-[320px] border">{children}</div>;
}

function WithMessagesStory() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        parts: [{ type: 'text' as const, text }],
      },
    ]);
    setInput('');
  };

  return (
    <PanelFrame>
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          {messages.length > 0 ? (
            <ChatMessageList messages={messages} />
          ) : (
            <ChatEmptyState suggestions={[]} onSuggestionClick={() => {}} />
          )}
        </div>
        <ChatInput value={input} onValueChange={setInput} onSubmit={handleSubmit} />
      </div>
    </PanelFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 空状態（デフォルト） */
export const Default: Story = {
  render: () => (
    <PanelFrame>
      <AIInspectorContent />
    </PanelFrame>
  ),
};

/** 会話表示（モックメッセージ付き） */
export const WithMessages: Story = {
  render: () => <WithMessagesStory />,
};

/** 幅広パネル（480px） */
export const Wide: Story = {
  render: () => (
    <div className="border-border h-[500px] w-[480px] border">
      <AIInspectorContent />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// AllPatterns
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PanelFrame>
        <AIInspectorContent />
      </PanelFrame>
      <WithMessagesStory />
    </div>
  ),
};
