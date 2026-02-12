import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUp } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button';

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from './prompt-input';
import { PromptSuggestion } from './prompt-suggestion';

/** PromptSuggestion - AIチャット用サジェストボタン */
const meta = {
  title: 'Features/AI/PromptSuggestion',
  component: PromptSuggestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: "What's on my schedule today?",
    onClick: fn(),
  },
} satisfies Meta<typeof PromptSuggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  'Tell me a joke',
  'How does this work?',
  'Generate an image of a cat',
  'Write a poem',
  'Code a React component',
];

function BasicExample() {
  const [input, setInput] = useState('');

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex w-[400px] flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <PromptSuggestion key={s} onClick={() => handleSuggestionClick(s)}>
            {s}
          </PromptSuggestion>
        ))}
      </div>
      <PromptInput value={input} onValueChange={setInput} onSubmit={() => setInput('')}>
        <PromptInputTextarea placeholder="Type a message or click a suggestion..." />
        <PromptInputActions className="justify-end pt-1">
          <PromptInputAction tooltip="Send">
            <Button
              variant="primary"
              icon
              size="sm"
              className="rounded-full"
              disabled={!input.trim()}
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 単体表示 */
export const Default: Story = {};

/** サジェスト + 入力エリア（prompt-kit basic） */
export const Basic: Story = {
  render: () => <BasicExample />,
};

/** ハイライト付き */
export const WithHighlight: Story = {
  args: {
    children: "What's on my schedule today?",
    highlight: 'schedule',
  },
};

// ---------------------------------------------------------------------------
// AllPatterns
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PromptSuggestion onClick={fn()}>Single suggestion</PromptSuggestion>
      <PromptSuggestion highlight="schedule" onClick={fn()}>
        What&apos;s on my schedule today?
      </PromptSuggestion>
      <BasicExample />
    </div>
  ),
};
