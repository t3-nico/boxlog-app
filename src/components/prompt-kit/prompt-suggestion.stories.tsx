import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from './prompt-input';
import { PromptSuggestion } from './prompt-suggestion';

/** PromptSuggestion - AIチャット用サジェストボタン */
const meta = {
  title: 'Components/PromptKit/PromptSuggestion',
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
            <button
              className="bg-foreground text-background flex size-8 items-center justify-center rounded-full disabled:opacity-50"
              disabled={!input.trim()}
              aria-label="Send"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </button>
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
