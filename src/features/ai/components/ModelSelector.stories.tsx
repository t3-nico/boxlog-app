import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ModelInfo } from '@/server/services/ai/types';

import { ModelSelector } from './ModelSelector';

const MOCK_ANTHROPIC_MODELS: ModelInfo[] = [
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

const MOCK_OPENAI_MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', providerId: 'openai', description: 'Most capable' },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    providerId: 'openai',
    description: 'Fast & affordable',
  },
];

/** ModelSelector - AIモデル選択Popover */
const meta = {
  title: 'Features/AI/ModelSelector',
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

function InteractiveModelSelector({
  models,
  defaultModelId,
}: {
  models: ModelInfo[];
  defaultModelId: string;
}) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  return (
    <div className="border-border w-[320px] border p-4">
      <ModelSelector
        models={models}
        selectedModelId={selectedModelId}
        defaultModelId={defaultModelId}
        onSelect={setSelectedModelId}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Anthropicモデル（デフォルト） */
export const Anthropic: Story = {
  render: () => (
    <InteractiveModelSelector
      models={MOCK_ANTHROPIC_MODELS}
      defaultModelId="claude-sonnet-4-5-20250929"
    />
  ),
};

/** OpenAIモデル */
export const OpenAI: Story = {
  render: () => (
    <InteractiveModelSelector models={MOCK_OPENAI_MODELS} defaultModelId="gpt-4o-mini" />
  ),
};

/** モデル1つのみ（セレクター非表示） */
export const SingleModel: Story = {
  render: () => (
    <InteractiveModelSelector
      models={MOCK_ANTHROPIC_MODELS.slice(0, 1)}
      defaultModelId="claude-sonnet-4-5-20250929"
    />
  ),
};

/** 無効状態 */
export const Disabled: Story = {
  render: () => (
    <div className="border-border w-[320px] border p-4">
      <ModelSelector
        models={MOCK_ANTHROPIC_MODELS}
        selectedModelId={null}
        defaultModelId="claude-sonnet-4-5-20250929"
        onSelect={() => {}}
        disabled
      />
    </div>
  ),
};
