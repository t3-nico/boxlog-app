import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { EstimationAccuracyData } from '../../types/metrics.types';

import { EstimationAccuracyChartPure } from './EstimationAccuracyChart';

// =============================================================================
// Mock Data
// =============================================================================

const mockData: EstimationAccuracyData[] = [
  {
    tagId: '1',
    tagName: 'Development',
    tagColor: 'blue',
    avgPlannedMinutes: 90,
    avgActualMinutes: 110,
    avgDeviationMinutes: 20,
    entryCount: 15,
  },
  {
    tagId: '2',
    tagName: 'Design',
    tagColor: 'purple',
    avgPlannedMinutes: 60,
    avgActualMinutes: 55,
    avgDeviationMinutes: 8,
    entryCount: 8,
  },
  {
    tagId: '3',
    tagName: 'Meeting',
    tagColor: 'green',
    avgPlannedMinutes: 30,
    avgActualMinutes: 45,
    avgDeviationMinutes: 15,
    entryCount: 12,
  },
  {
    tagId: '4',
    tagName: 'Writing',
    tagColor: 'orange',
    avgPlannedMinutes: 120,
    avgActualMinutes: 100,
    avgDeviationMinutes: 22,
    entryCount: 5,
  },
  {
    tagId: '5',
    tagName: 'Research',
    tagColor: 'indigo',
    avgPlannedMinutes: 45,
    avgActualMinutes: 70,
    avgDeviationMinutes: 25,
    entryCount: 6,
  },
];

// =============================================================================
// Meta
// =============================================================================

/** EstimationAccuracyChart — タグ別の予定 vs 実績時間を比較する棒グラフ */
const meta = {
  title: 'Features/Stats/Layer1/EstimationAccuracyChart',
  component: EstimationAccuracyChartPure,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EstimationAccuracyChartPure>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Stories
// =============================================================================

/** 典型的なデータ: 過大見積もり・過小見積もりが混在 */
export const Default: Story = {
  args: {
    data: mockData,
  },
};

/** ローディング状態 */
export const Loading: Story = {
  args: {
    data: null,
    isLoading: true,
  },
};

/** データなし */
export const Empty: Story = {
  args: {
    data: [],
  },
};

/** 1タグのみ */
export const SingleTag: Story = {
  args: {
    data: mockData.slice(0, 1),
  },
};

/** 過大見積もり傾向（予定 > 実績） */
export const OverEstimating: Story = {
  args: {
    data: [
      {
        tagId: '1',
        tagName: 'Development',
        tagColor: 'blue',
        avgPlannedMinutes: 120,
        avgActualMinutes: 80,
        avgDeviationMinutes: 40,
        entryCount: 10,
      },
      {
        tagId: '2',
        tagName: 'Design',
        tagColor: 'purple',
        avgPlannedMinutes: 90,
        avgActualMinutes: 60,
        avgDeviationMinutes: 30,
        entryCount: 7,
      },
    ],
  },
};

/** 過小見積もり傾向（実績 > 予定） */
export const UnderEstimating: Story = {
  args: {
    data: [
      {
        tagId: '1',
        tagName: 'Development',
        tagColor: 'blue',
        avgPlannedMinutes: 60,
        avgActualMinutes: 110,
        avgDeviationMinutes: 50,
        entryCount: 10,
      },
      {
        tagId: '2',
        tagName: 'Meeting',
        tagColor: 'green',
        avgPlannedMinutes: 30,
        avgActualMinutes: 55,
        avgDeviationMinutes: 25,
        entryCount: 12,
      },
    ],
  },
};

/** 長時間タスク（1h以上） */
export const LongDurations: Story = {
  args: {
    data: [
      {
        tagId: '1',
        tagName: 'Deep Work',
        tagColor: 'blue',
        avgPlannedMinutes: 180,
        avgActualMinutes: 210,
        avgDeviationMinutes: 30,
        entryCount: 4,
      },
      {
        tagId: '2',
        tagName: 'Workshop',
        tagColor: 'green',
        avgPlannedMinutes: 240,
        avgActualMinutes: 200,
        avgDeviationMinutes: 40,
        entryCount: 3,
      },
    ],
  },
};
