import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ChatMessage } from '../types';

import {
  MOCK_MARKDOWN_MESSAGES,
  MOCK_MESSAGES,
  MOCK_TOOL_MESSAGES,
} from './__mocks__/chatMockData';
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

function ChatPanelStory({
  initialMessages,
  width = 320,
  showHeader = false,
}: {
  initialMessages: ChatMessage[];
  width?: number;
  showHeader?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
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

  const hasMessages = messages.length > 0;

  return (
    <div className="border-border border" style={{ height: 500, width }}>
      <div className="flex h-full flex-col">
        {showHeader && hasMessages && (
          <div className="border-border flex shrink-0 items-center justify-end border-b px-3 py-1.5">
            <button
              className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
              onClick={() => setMessages([])}
              aria-label="New conversation"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1">
          {hasMessages ? (
            <ChatMessageList messages={messages} />
          ) : (
            <ChatEmptyState suggestions={[]} onSuggestionClick={() => {}} />
          )}
        </div>
        <ChatInput value={input} onValueChange={setInput} onSubmit={handleSubmit} />
      </div>
    </div>
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

/** 会話表示（プレーンテキスト） */
export const WithMessages: Story = {
  render: () => <ChatPanelStory initialMessages={MOCK_MESSAGES} />,
};

/** Markdown描画付き会話 */
export const WithMarkdown: Story = {
  render: () => <ChatPanelStory initialMessages={MOCK_MARKDOWN_MESSAGES} />,
};

/** ツール呼び出し付き会話 */
export const WithToolInvocations: Story = {
  render: () => <ChatPanelStory initialMessages={MOCK_TOOL_MESSAGES} />,
};

/** フルシナリオ（ツール呼び出し → Markdown回答 → 入力可能） */
export const FullScenario: Story = {
  render: () => (
    <ChatPanelStory
      initialMessages={[
        ...MOCK_TOOL_MESSAGES,
        {
          id: 'followup-1',
          role: 'user' as const,
          parts: [{ type: 'text' as const, text: 'タグ別の内訳も教えて' }],
        },
        {
          id: 'followup-2',
          role: 'assistant' as const,
          parts: [
            {
              type: 'tool-getTagStats' as const,
              toolCallId: 'call-2',
              state: 'output-available' as const,
              input: {},
              output: { tags: Array.from({ length: 5 }) },
            } as ChatMessage['parts'][number],
            {
              type: 'text' as const,
              text: '## タグ別内訳\n\n| Tag | Hours | Records |\n|-----|-------|---------|\n| Work | 25h | 30 |\n| Exercise | 8h | 10 |\n| Reading | 4h | 3 |\n| Meeting | 2h | 1 |\n| Other | 1h | 1 |\n\n**Work** が全体の62.5%を占めています。',
            },
          ],
        } as ChatMessage,
      ]}
      width={360}
    />
  ),
};

/** ヘッダーバー付き（New ボタン + コピーボタン確認） */
export const WithHeader: Story = {
  render: () => <ChatPanelStory initialMessages={MOCK_MESSAGES} showHeader />,
};

/** エラー表示 + リトライボタン */
export const WithError: Story = {
  render: () => (
    <div className="border-border h-[500px] w-[320px] border">
      <div className="flex h-full flex-col">
        {/* ヘッダーバー */}
        <div className="border-border flex shrink-0 items-center justify-end border-b px-3 py-1.5">
          <button
            className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md"
            aria-label="New conversation"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        {/* エラーバナー */}
        <div className="bg-destructive/10 text-destructive flex shrink-0 items-center gap-2 px-4 py-2 text-xs">
          <span className="flex-1">API request failed: 429 Too Many Requests</span>
          <button className="text-destructive hover:text-destructive inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium">
            <svg
              className="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry
          </button>
        </div>
        {/* メッセージ */}
        <div className="min-h-0 flex-1">
          <ChatMessageList messages={MOCK_MESSAGES} />
        </div>
        <ChatInput value="" onValueChange={() => {}} onSubmit={() => {}} />
      </div>
    </div>
  ),
};

/** 幅広パネル（480px） */
export const Wide: Story = {
  render: () => <ChatPanelStory initialMessages={MOCK_TOOL_MESSAGES} width={480} />,
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
      <ChatPanelStory initialMessages={MOCK_MESSAGES} />
      <ChatPanelStory initialMessages={MOCK_TOOL_MESSAGES} />
      <ChatPanelStory initialMessages={MOCK_MARKDOWN_MESSAGES} />
    </div>
  ),
};
