import type { ChatMessage } from '../../types';

/**
 * UIMessage互換のモックメッセージを生成
 */
function createMessage(id: string, role: 'user' | 'assistant', text: string): ChatMessage {
  return {
    id,
    role,
    parts: [{ type: 'text' as const, text }],
  };
}

export const MOCK_MESSAGES: ChatMessage[] = [
  createMessage('msg-1', 'user', "What's on my schedule today?"),
  createMessage(
    'msg-2',
    'assistant',
    "You have 3 items scheduled for today:\n\n1. 09:00-10:00 Team meeting\n2. 13:00-14:00 Design review\n3. 15:00-16:00 1-on-1 with manager\n\nYou also have 2 overdue plans from yesterday that haven't been completed.",
  ),
  createMessage('msg-3', 'user', 'Help me organize my tags'),
  createMessage(
    'msg-4',
    'assistant',
    'You currently have 12 tags. I found 3 tags with low usage that could be merged:\n\n- "meetings" and "mtg" (similar purpose)\n- "personal" has no records in the last 30 days\n\nWould you like me to suggest a reorganization?',
  ),
];

export const MOCK_LONG_CONVERSATION: ChatMessage[] = [
  ...MOCK_MESSAGES,
  createMessage('msg-5', 'user', 'Yes, please reorganize them'),
  createMessage(
    'msg-6',
    'assistant',
    'Here\'s my suggestion:\n\n1. Merge "meetings" and "mtg" into "Meetings"\n2. Archive "personal" (0 records in 30 days)\n3. Keep the remaining 10 tags as-is\n\nShall I proceed with these changes?',
  ),
  createMessage('msg-7', 'user', 'Go ahead'),
  createMessage(
    'msg-8',
    'assistant',
    'Done! I\'ve merged "meetings" and "mtg" into "Meetings" and archived "personal". You now have 10 active tags.',
  ),
];

/** ツール呼び出し付きモックメッセージ */
export const MOCK_TOOL_MESSAGES: ChatMessage[] = [
  createMessage('tool-1', 'user', '先月の作業時間は？'),
  {
    id: 'tool-2',
    role: 'assistant' as const,
    parts: [
      {
        type: 'tool-searchRecords' as const,
        toolCallId: 'call-1',
        state: 'output-available' as const,
        input: { workedAtFrom: '2026-01-01', workedAtTo: '2026-01-31' },
        output: { count: 45, totalMinutes: 2400, totalHours: 40, records: [] },
      },
      {
        type: 'text' as const,
        text: '先月は**45件**の作業記録があり、合計**40時間**でした。\n\n## 内訳\n- 週平均: 約10時間\n- 最も多い日: 1月15日 (3.5時間)\n\n充実度スコアの平均は **3.8/5** でした。',
      },
    ],
  } as ChatMessage,
];

/** Markdown描画テスト用モックメッセージ */
export const MOCK_MARKDOWN_MESSAGES: ChatMessage[] = [
  createMessage('md-1', 'user', 'Show my stats'),
  createMessage(
    'md-2',
    'assistant',
    "## Your Weekly Summary\n\n| Category | Hours |\n|----------|-------|\n| Work | 32h |\n| Exercise | 5h |\n| Reading | 3h |\n\n### Highlights\n- **Best day**: Monday (8h productive)\n- Completed 12 tasks\n- Fulfillment average: `4.2/5`\n\n> You're on a 5-day streak!",
  ),
];

export const DEFAULT_SUGGESTIONS = [
  "What's on my schedule today?",
  'Help me organize tags',
  'Show my stats',
];
