import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ScheduleRow } from './ScheduleRow';

/**
 * ScheduleRow — 日付 + 時間 + Duration 入力行
 *
 * ## Props
 * - `selectedDate: Date | undefined` — 選択中の日付
 * - `startTime: string` — 開始時刻 "HH:MM"
 * - `endTime: string` — 終了時刻 "HH:MM"
 * - `onDateChange, onStartTimeChange, onEndTimeChange` — 変更コールバック
 * - `disabled: boolean` — 全フィールド無効化
 * - `timeConflictError: boolean` — 時間重複エラー表示
 * - `datePlaceholder: string` — 日付プレースホルダー（i18n対応）
 *
 * ## 内部コンポーネント
 * - DatePickerPopover（日付選択）
 * - ClockTimePicker × 2（開始 + 終了、minTime制約あり）
 * - useAutoAdjustEndTime（開始時刻変更 → 終了時刻自動調整）
 *
 * ## Duration 自動計算
 * - "2h 30m" / "2h" / "30m" 形式で表示
 * - 終了 < 開始 → 0（非表示）
 *
 * ## 使用箇所
 * - Plan Inspector DetailsTab Row 2
 * - Record Inspector Row 2
 */
const meta = {
  title: 'Features/Plans/ScheduleRow',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

function ScheduleRowStory({
  initialDate,
  initialStartTime = '',
  initialEndTime = '',
  disabled = false,
  timeConflictError = false,
}: {
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  disabled?: boolean;
  timeConflictError?: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  return (
    <ScheduleRow
      selectedDate={selectedDate}
      startTime={startTime}
      endTime={endTime}
      onDateChange={setSelectedDate}
      onStartTimeChange={setStartTime}
      onEndTimeChange={setEndTime}
      disabled={disabled}
      timeConflictError={timeConflictError}
    />
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 初期状態 — 日付・時間ともに未設定 */
export const Empty: Story = {
  render: () => <ScheduleRowStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 日付ピッカー（未選択）が表示される
    const datePicker = canvas.getByRole('button', { name: /日付選択: 未選択/i });
    await expect(datePicker).toBeInTheDocument();

    // 時刻ピッカー（combobox）が2つ表示される
    const comboboxes = canvas.getAllByRole('combobox');
    await expect(comboboxes).toHaveLength(2);

    // 区切りのダッシュ
    await expect(canvas.getByText('–')).toBeInTheDocument();
  },
};

/** 日付 + 時間 + Duration表示 */
export const WithDateTime: Story = {
  render: () => (
    <ScheduleRowStory initialDate={new Date()} initialStartTime="10:00" initialEndTime="11:30" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Duration "1h 30m" が表示される
    await expect(canvas.getByText('1h 30m')).toBeInTheDocument();

    // 時刻ピッカーに値が入っている
    const comboboxes = canvas.getAllByRole('combobox');
    await expect(comboboxes[0]).toHaveValue('10:00');
    await expect(comboboxes[1]).toHaveValue('11:30');
  },
};

/** 日付なし、時間のみ */
export const TimeOnly: Story = {
  render: () => <ScheduleRowStory initialStartTime="14:00" initialEndTime="15:00" />,
};

/** 時間重複エラー表示 */
export const TimeConflict: Story = {
  render: () => (
    <ScheduleRowStory
      initialDate={new Date()}
      initialStartTime="10:00"
      initialEndTime="11:00"
      timeConflictError
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // エラーアラートが表示される
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeInTheDocument();
    await expect(canvas.getByText('既存の予定と時間が重複しています')).toBeInTheDocument();

    // 時刻ピッカーにエラー状態が反映される
    const comboboxes = canvas.getAllByRole('combobox');
    await expect(comboboxes[0]).toHaveAttribute('aria-invalid', 'true');
    await expect(comboboxes[1]).toHaveAttribute('aria-invalid', 'true');
  },
};

/** 全フィールド無効化 */
export const Disabled: Story = {
  render: () => (
    <ScheduleRowStory
      initialDate={new Date()}
      initialStartTime="10:00"
      initialEndTime="11:00"
      disabled
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 時刻ピッカーが無効化されている
    const comboboxes = canvas.getAllByRole('combobox');
    await expect(comboboxes[0]).toBeDisabled();
    await expect(comboboxes[1]).toBeDisabled();
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Empty */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Empty</p>
        <ScheduleRowStory />
      </div>

      {/* With DateTime */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">With DateTime (1h 30m)</p>
        <ScheduleRowStory
          initialDate={new Date()}
          initialStartTime="10:00"
          initialEndTime="11:30"
        />
      </div>

      {/* Time Only */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Time Only (1h)</p>
        <ScheduleRowStory initialStartTime="14:00" initialEndTime="15:00" />
      </div>

      {/* Time Conflict */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Time Conflict</p>
        <ScheduleRowStory
          initialDate={new Date()}
          initialStartTime="10:00"
          initialEndTime="11:00"
          timeConflictError
        />
      </div>

      {/* Disabled */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Disabled</p>
        <ScheduleRowStory
          initialDate={new Date()}
          initialStartTime="10:00"
          initialEndTime="11:00"
          disabled
        />
      </div>
    </div>
  ),
};
