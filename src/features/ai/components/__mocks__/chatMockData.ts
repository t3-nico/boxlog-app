import type { ChatMessage } from '../../types';

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: "What's on my schedule today?",
    createdAt: new Date('2025-01-15T09:00:00'),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      "You have 3 items scheduled for today:\n\n1. 09:00-10:00 Team meeting\n2. 13:00-14:00 Design review\n3. 15:00-16:00 1-on-1 with manager\n\nYou also have 2 overdue plans from yesterday that haven't been completed.",
    createdAt: new Date('2025-01-15T09:00:05'),
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Help me organize my tags',
    createdAt: new Date('2025-01-15T09:01:00'),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content:
      'You currently have 12 tags. I found 3 tags with low usage that could be merged:\n\n- "meetings" and "mtg" (similar purpose)\n- "personal" has no records in the last 30 days\n\nWould you like me to suggest a reorganization?',
    createdAt: new Date('2025-01-15T09:01:03'),
  },
];

export const MOCK_LONG_CONVERSATION: ChatMessage[] = [
  ...MOCK_MESSAGES,
  {
    id: 'msg-5',
    role: 'user',
    content: 'Yes, please reorganize them',
    createdAt: new Date('2025-01-15T09:02:00'),
  },
  {
    id: 'msg-6',
    role: 'assistant',
    content:
      'Here\'s my suggestion:\n\n1. Merge "meetings" and "mtg" into "Meetings"\n2. Archive "personal" (0 records in 30 days)\n3. Keep the remaining 10 tags as-is\n\nShall I proceed with these changes?',
    createdAt: new Date('2025-01-15T09:02:05'),
  },
  {
    id: 'msg-7',
    role: 'user',
    content: 'Go ahead',
    createdAt: new Date('2025-01-15T09:03:00'),
  },
  {
    id: 'msg-8',
    role: 'assistant',
    content:
      'Done! I\'ve merged "meetings" and "mtg" into "Meetings" and archived "personal". You now have 10 active tags.',
    createdAt: new Date('2025-01-15T09:03:03'),
  },
];

export const DEFAULT_SUGGESTIONS = [
  "What's on my schedule today?",
  'Help me organize tags',
  'Show my stats',
];
