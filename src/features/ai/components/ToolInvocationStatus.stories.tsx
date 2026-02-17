import type { Meta, StoryObj } from '@storybook/react-vite';

import type { UIMessage } from 'ai';

import { ToolInvocationStatus } from './ToolInvocationStatus';

type UIMessagePart = UIMessage['parts'][number];

const meta = {
  title: 'Features/AI/ToolInvocationStatus',
  component: ToolInvocationStatus,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToolInvocationStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createToolPart(toolName: string, state: string, output?: unknown): UIMessagePart {
  return {
    type: `tool-${toolName}`,
    toolCallId: `call-${Date.now()}`,
    state,
    input: {},
    ...(output !== undefined ? { output } : {}),
  } as UIMessagePart;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** ローディング中 */
export const Loading: Story = {
  args: {
    part: createToolPart('searchPlans', 'input-available'),
  },
};

/** 成功 - Plans */
export const SuccessPlans: Story = {
  args: {
    part: createToolPart('searchPlans', 'output-available', { count: 5, plans: [] }),
  },
};

/** 成功 - Records */
export const SuccessRecords: Story = {
  args: {
    part: createToolPart('searchRecords', 'output-available', {
      count: 12,
      totalHours: 8.5,
      records: [],
    }),
  },
};

/** 成功 - Statistics */
export const SuccessStatistics: Story = {
  args: {
    part: createToolPart('getStatistics', 'output-available', {
      plannedHours: 40.5,
      recordedHours: 35.2,
    }),
  },
};

/** 成功 - Tags */
export const SuccessTags: Story = {
  args: {
    part: createToolPart('getTagStats', 'output-available', {
      tags: Array.from({ length: 8 }),
    }),
  },
};

/** エラー */
export const Error: Story = {
  args: {
    part: createToolPart('searchRecords', 'output-error'),
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    part: createToolPart('searchPlans', 'input-available'),
  },
  render: () => {
    const parts = [
      createToolPart('searchPlans', 'input-available'),
      createToolPart('searchPlans', 'output-available', { count: 5, plans: [] }),
      createToolPart('searchRecords', 'output-available', {
        count: 12,
        totalHours: 8.5,
        records: [],
      }),
      createToolPart('getStatistics', 'output-available', {
        plannedHours: 40.5,
        recordedHours: 35.2,
      }),
      createToolPart('getTagStats', 'output-available', { tags: Array.from({ length: 8 }) }),
      createToolPart('searchRecords', 'output-error'),
    ];

    return (
      <div className="flex max-w-md flex-col gap-2">
        {parts.map((part, i) => (
          <ToolInvocationStatus key={i} part={part} />
        ))}
      </div>
    );
  },
};
