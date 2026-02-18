import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ModelInfo } from '@/server/services/ai/types';

import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';

const MOCK_MODELS: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Sonnet 4.5',
    providerId: 'anthropic',
    description: 'Balanced performance',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Haiku 4.5',
    providerId: 'anthropic',
    description: 'Fast & affordable',
  },
];

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

/** デフォルト（空の入力フォーム） */
export const Default: Story = {
  render: () => <InteractiveChatInput />,
};

/** ストリーミング中（ローディング状態） */
export const Loading: Story = {
  render: () => <InteractiveChatInput isLoading />,
};

// ---------------------------------------------------------------------------
// AllPatterns
// ---------------------------------------------------------------------------

/** モデルセレクター付き */
export const WithModelSelector: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    return (
      <div className="border-border w-[320px] border">
        <ChatInput
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue('')}
          onStop={() => {}}
          startActions={
            <ModelSelector
              models={MOCK_MODELS}
              selectedModelId={selectedModelId}
              defaultModelId="claude-sonnet-4-5-20250929"
              onSelect={setSelectedModelId}
            />
          }
        />
      </div>
    );
  },
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
