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

export const DEFAULT_SUGGESTIONS = [
  "What's on my schedule today?",
  'Help me organize tags',
  'Show my stats',
];
