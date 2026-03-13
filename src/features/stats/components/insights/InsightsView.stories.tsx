import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowLeftRight, Clock, Flame, Gauge, Ratio, Sparkles, Target, Timer } from 'lucide-react';

import type { EstimationAccuracyData } from '../../types/metrics.types';
import type { TagTimeData } from '../charts/TagTimeChart';
import { TagTimeChartPure } from '../charts/TagTimeChart';
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

const mockTagTimeData: TagTimeData[] = [
  { tagId: '1', name: 'Development', color: 'hsl(221, 83%, 53%)', hours: 18.5 },
  { tagId: '2', name: 'Design', color: 'hsl(271, 91%, 65%)', hours: 8.2 },
  { tagId: '3', name: 'Meeting', color: 'hsl(142, 71%, 45%)', hours: 6.8 },
  { tagId: '4', name: 'Planning', color: 'hsl(38, 92%, 50%)', hours: 3.5 },
  { tagId: '5', name: 'Review', color: 'hsl(0, 84%, 60%)', hours: 1.2 },
];

// =============================================================================
// Meta
// =============================================================================

/**
 * ReviewView — 振り返りタブの全体レイアウト
 *
 * Layer 1: KPIメトリクスグリッド（8カード） + タグ別時間チャート + 見積もり精度チャート
 * （このStoryはtRPCなしでモックデータを直接使用）
 */
const meta = {
  title: 'Features/Stats/Layer1/ReviewView',
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
          {/* KPI Metrics Grid — 8 cards with hero variants */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Total Time"
              valueParts={{ primary: '38', unit: 'h', secondary: '15', secondaryUnit: 'm' }}
              icon={Clock}
              variant="hero"
              trend={{ direction: 'up', delta: 0.12, isPositive: true }}
            />
            <MetricCard
              label="Avg Fulfillment"
              valueParts={{ primary: '3.8', unit: '' }}
              icon={Sparkles}
              trend={{ direction: 'up', delta: 0.1, isPositive: true }}
            />
            <MetricCard
              label="Plan Rate"
              valueParts={{ primary: '72', unit: '%' }}
              icon={Target}
              trend={{ direction: 'up', delta: 0.05, isPositive: true }}
              progress={0.72}
              progressStatus="good"
            />
            <MetricCard
              label="Streak"
              valueParts={{ primary: '23', unit: 'days' }}
              icon={Flame}
              variant="hero"
            />
            <MetricCard
              label="Estimation Accuracy"
              valueParts={{ primary: '12', unit: 'm' }}
              icon={Timer}
              trend={{ direction: 'down', delta: -0.15, isPositive: true }}
              progress={0.73}
              progressStatus="good"
            />
            <MetricCard
              label="Peak Utilization"
              valueParts={{ primary: '65', unit: '%' }}
              icon={Gauge}
              trend={{ direction: 'up', delta: 0.08, isPositive: true }}
              progress={0.65}
              progressStatus="good"
            />
            <MetricCard
              label="Context Switches"
              valueParts={{ primary: '3.2', unit: '' }}
              icon={ArrowLeftRight}
              trend={{ direction: 'flat', delta: 0.01, isPositive: true }}
            />
            <MetricCard
              label="Blank Rate"
              valueParts={{ primary: '28', unit: '%' }}
              icon={Ratio}
              trend={{ direction: 'down', delta: -0.03, isPositive: true }}
              progress={0.28}
              progressStatus="warning"
            />
          </div>

          {/* Tag Time Chart */}
          <TagTimeChartPure data={mockTagTimeData} />

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
            <MetricCard
              label="Total Time"
              valueParts={{ primary: '-', unit: '' }}
              variant="hero"
              isLoading
            />
            <MetricCard label="Avg Fulfillment" valueParts={{ primary: '-', unit: '' }} isLoading />
            <MetricCard label="Plan Rate" valueParts={{ primary: '-', unit: '' }} isLoading />
            <MetricCard
              label="Streak"
              valueParts={{ primary: '-', unit: '' }}
              variant="hero"
              isLoading
            />
            <MetricCard
              label="Estimation Accuracy"
              valueParts={{ primary: '-', unit: '' }}
              isLoading
            />
            <MetricCard
              label="Peak Utilization"
              valueParts={{ primary: '-', unit: '' }}
              isLoading
            />
            <MetricCard
              label="Context Switches"
              valueParts={{ primary: '-', unit: '' }}
              isLoading
            />
            <MetricCard label="Blank Rate" valueParts={{ primary: '-', unit: '' }} isLoading />
          </div>
          <TagTimeChartPure data={null} isLoading />
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
            <MetricCard
              label="Total Time"
              valueParts={{ primary: '-', unit: '' }}
              icon={Clock}
              variant="hero"
            />
            <MetricCard
              label="Avg Fulfillment"
              valueParts={{ primary: '-', unit: '' }}
              icon={Sparkles}
            />
            <MetricCard label="Plan Rate" valueParts={{ primary: '-', unit: '' }} icon={Target} />
            <MetricCard
              label="Streak"
              valueParts={{ primary: '-', unit: '' }}
              icon={Flame}
              variant="hero"
            />
            <MetricCard
              label="Estimation Accuracy"
              valueParts={{ primary: '-', unit: '' }}
              icon={Timer}
            />
            <MetricCard
              label="Peak Utilization"
              valueParts={{ primary: '-', unit: '' }}
              icon={Gauge}
            />
            <MetricCard
              label="Context Switches"
              valueParts={{ primary: '-', unit: '' }}
              icon={ArrowLeftRight}
            />
            <MetricCard label="Blank Rate" valueParts={{ primary: '-', unit: '' }} icon={Ratio} />
          </div>
          <TagTimeChartPure data={[]} />
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
              valueParts={{ primary: '52', unit: 'h', secondary: '30', secondaryUnit: 'm' }}
              icon={Clock}
              variant="hero"
              trend={{ direction: 'up', delta: 0.15, isPositive: true }}
            />
            <MetricCard
              label="Avg Fulfillment"
              valueParts={{ primary: '4.5', unit: '' }}
              icon={Sparkles}
              trend={{ direction: 'up', delta: 0.08, isPositive: true }}
            />
            <MetricCard
              label="Plan Rate"
              valueParts={{ primary: '95', unit: '%' }}
              icon={Target}
              trend={{ direction: 'up', delta: 0.03, isPositive: true }}
              progress={0.95}
              progressStatus="good"
            />
            <MetricCard
              label="Streak"
              valueParts={{ primary: '45', unit: 'days' }}
              icon={Flame}
              variant="hero"
            />
            <MetricCard
              label="Estimation Accuracy"
              valueParts={{ primary: '5', unit: 'm' }}
              icon={Timer}
              trend={{ direction: 'down', delta: -0.2, isPositive: true }}
              progress={0.89}
              progressStatus="good"
            />
            <MetricCard
              label="Peak Utilization"
              valueParts={{ primary: '88', unit: '%' }}
              icon={Gauge}
              trend={{ direction: 'up', delta: 0.1, isPositive: true }}
              progress={0.88}
              progressStatus="good"
            />
            <MetricCard
              label="Context Switches"
              valueParts={{ primary: '1.5', unit: '' }}
              icon={ArrowLeftRight}
              trend={{ direction: 'flat', delta: 0, isPositive: true }}
            />
            <MetricCard
              label="Blank Rate"
              valueParts={{ primary: '8', unit: '%' }}
              icon={Ratio}
              trend={{ direction: 'down', delta: -0.05, isPositive: true }}
              progress={0.08}
              progressStatus="good"
            />
          </div>
          <TagTimeChartPure
            data={[
              { tagId: '1', name: 'Deep Work', color: 'hsl(221, 83%, 53%)', hours: 28.5 },
              { tagId: '2', name: 'Meeting', color: 'hsl(142, 71%, 45%)', hours: 12.0 },
              { tagId: '3', name: 'Planning', color: 'hsl(38, 92%, 50%)', hours: 8.5 },
              { tagId: '4', name: 'Review', color: 'hsl(271, 91%, 65%)', hours: 3.5 },
            ]}
          />
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
