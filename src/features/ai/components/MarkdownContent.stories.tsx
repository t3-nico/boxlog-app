import type { Meta, StoryObj } from '@storybook/react-vite';

import { MarkdownContent } from './MarkdownContent';

const meta = {
  title: 'Features/AI/MarkdownContent',
  component: MarkdownContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 基本的なテキスト */
export const Default: Story = {
  args: {
    content: 'Hello! This is a simple text response from the AI assistant.',
  },
};

/** 見出し・リスト・太字 */
export const WithHeadingsAndLists: Story = {
  args: {
    content: `## Your Weekly Summary

Here are your highlights:

- **Best day**: Monday (8h productive)
- Completed 12 tasks
- Fulfillment average: 4.2/5

### Areas for Improvement

1. Morning routines could start earlier
2. Consider blocking time for deep work
3. Reduce meeting overload on Wednesdays`,
  },
};

/** テーブル（GFM） */
export const WithTable: Story = {
  args: {
    content: `## Time Distribution

| Category | Hours | % of Total |
|----------|-------|------------|
| Work | 32h | 64% |
| Exercise | 5h | 10% |
| Reading | 3h | 6% |
| Social | 4h | 8% |
| Other | 6h | 12% |

> You're spending most of your time on work. Consider balancing with more leisure.`,
  },
};

/** コードブロック */
export const WithCodeBlock: Story = {
  args: {
    content: `Here's a quick breakdown of your schedule format:

\`\`\`
09:00-10:00  Team meeting [work]
10:30-12:00  Deep work block [focus]
13:00-14:00  Design review [work]
\`\`\`

You can also use inline code like \`fulfillment: 4.5/5\` for metrics.`,
  },
};

/** リンク */
export const WithLinks: Story = {
  args: {
    content: `For more productivity tips, check out:

- [Time blocking guide](https://example.com/time-blocking)
- [Pomodoro technique](https://example.com/pomodoro)

These links open in a new tab for convenience.`,
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    content: '',
  },
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <MarkdownContent content="Simple text response." />
      <MarkdownContent
        content={`## Heading\n\n- Item 1\n- **Bold item**\n- Item 3\n\n> A blockquote`}
      />
      <MarkdownContent
        content={`| Tag | Hours |\n|-----|-------|\n| Work | 20h |\n| Exercise | 5h |`}
      />
      <MarkdownContent content={`Inline \`code\` and:\n\n\`\`\`\ncode block\n\`\`\``} />
    </div>
  ),
};
