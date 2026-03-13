import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { EstimationAccuracyData } from '../../types/metrics.types';
import { MetricCard } from '../metrics/MetricCard';

import { EstimationAccuracyChartPure } from './EstimationAccuracyChart';

// =============================================================================
// Mock Data
// =============================================================================

const mockEstimationData: EstimationAccuracyData[] = [
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
];

// =============================================================================
// Meta
// =============================================================================

/**
 * InsightsView — Insightsタブの全体レイアウト
 *
 * Layer 1: KPIメトリクスグリッド（8カード） + 見積もり精度チャート
 * （このStoryはtRPCなしでモックデータを直接使用）
 */
const meta = {
  title: 'Features/Stats/Layer1/InsightsView',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Stories
// =============================================================================

/** データありの典型的なInsightsタブ */
export const WithData: Story = {
  render: () => (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* KPI Metrics Grid — 8 cards: 2x4 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Total Time"
              value="38h 15m"
              description="Total tracked time"
              trend={{ direction: 'up', delta: 0.12, isPositive: true }}
            />
            <MetricCard
              label="Avg Fulfillment"
              value="3.8"
              description="Average fulfillment score"
              trend={{ direction: 'up', delta: 0.1, isPositive: true }}
            />
            <MetricCard
              label="Plan Rate"
              value="72%"
              description="Ratio of planned entries"
              trend={{ direction: 'up', delta: 0.05, isPositive: true }}
              status="good"
            />
            <MetricCard label="Streak" value="23 days" description="Current streak" />
            <MetricCard
              label="Estimation Accuracy"
              value="12m"
              description="Avg deviation from planned time"
              trend={{ direction: 'down', delta: -0.15, isPositive: true }}
              status="warning"
            />
            <MetricCard
              label="Peak Utilization"
              value="65%"
              description="Activity during peak hours"
              trend={{ direction: 'up', delta: 0.08, isPositive: true }}
              status="good"
            />
            <MetricCard
              label="Context Switches"
              value="3.2"
              description="Tag changes per day"
              trend={{ direction: 'flat', delta: 0.01, isPositive: true }}
            />
            <MetricCard
              label="Blank Rate"
              value="28%"
              description="Unscheduled time ratio"
              trend={{ direction: 'down', delta: -0.03, isPositive: true }}
              status="warning"
            />
          </div>

          {/* Estimation Accuracy Chart */}
          <EstimationAccuracyChartPure data={mockEstimationData} />
        </div>
      </div>
    </div>
  ),
};

/** ローディング状態 */
export const Loading: Story = {
  render: () => (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Total Time" value="-" description="" isLoading />
            <MetricCard label="Avg Fulfillment" value="-" description="" isLoading />
            <MetricCard label="Plan Rate" value="-" description="" isLoading />
            <MetricCard label="Streak" value="-" description="" isLoading />
            <MetricCard label="Estimation Accuracy" value="-" description="" isLoading />
            <MetricCard label="Peak Utilization" value="-" description="" isLoading />
            <MetricCard label="Context Switches" value="-" description="" isLoading />
            <MetricCard label="Blank Rate" value="-" description="" isLoading />
          </div>
          <EstimationAccuracyChartPure data={null} isLoading />
        </div>
      </div>
    </div>
  ),
};

/** データなし（新規ユーザー） */
export const Empty: Story = {
  render: () => (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Total Time" value="-" description="Total tracked time" />
            <MetricCard label="Avg Fulfillment" value="-" description="Average fulfillment score" />
            <MetricCard label="Plan Rate" value="-" description="Ratio of planned entries" />
            <MetricCard label="Streak" value="-" description="Current streak" />
            <MetricCard
              label="Estimation Accuracy"
              value="-"
              description="Avg deviation from planned time"
            />
            <MetricCard
              label="Peak Utilization"
              value="-"
              description="Activity during peak hours"
            />
            <MetricCard label="Context Switches" value="-" description="Tag changes per day" />
            <MetricCard label="Blank Rate" value="-" description="Unscheduled time ratio" />
          </div>
          <EstimationAccuracyChartPure data={[]} />
        </div>
      </div>
    </div>
  ),
};

/** 高パフォーマンスユーザー */
export const HighPerformance: Story = {
  render: () => (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Total Time"
              value="52h 30m"
              description="Total tracked time"
              trend={{ direction: 'up', delta: 0.15, isPositive: true }}
            />
            <MetricCard
              label="Avg Fulfillment"
              value="4.5"
              description="Average fulfillment score"
              trend={{ direction: 'up', delta: 0.08, isPositive: true }}
            />
            <MetricCard
              label="Plan Rate"
              value="95%"
              description="Ratio of planned entries"
              trend={{ direction: 'up', delta: 0.03, isPositive: true }}
              status="good"
            />
            <MetricCard label="Streak" value="45 days" description="Current streak" />
            <MetricCard
              label="Estimation Accuracy"
              value="5m"
              description="Avg deviation from planned time"
              trend={{ direction: 'down', delta: -0.2, isPositive: true }}
              status="good"
            />
            <MetricCard
              label="Peak Utilization"
              value="88%"
              description="Activity during peak hours"
              trend={{ direction: 'up', delta: 0.1, isPositive: true }}
              status="good"
            />
            <MetricCard
              label="Context Switches"
              value="1.5"
              description="Tag changes per day"
              trend={{ direction: 'flat', delta: 0, isPositive: true }}
            />
            <MetricCard
              label="Blank Rate"
              value="8%"
              description="Unscheduled time ratio"
              trend={{ direction: 'down', delta: -0.05, isPositive: true }}
              status="good"
            />
          </div>
          <EstimationAccuracyChartPure
            data={[
              {
                tagId: '1',
                tagName: 'Deep Work',
                tagColor: 'blue',
                avgPlannedMinutes: 90,
                avgActualMinutes: 95,
                avgDeviationMinutes: 5,
                entryCount: 20,
              },
              {
                tagId: '2',
                tagName: 'Meeting',
                tagColor: 'green',
                avgPlannedMinutes: 30,
                avgActualMinutes: 32,
                avgDeviationMinutes: 3,
                entryCount: 15,
              },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};
