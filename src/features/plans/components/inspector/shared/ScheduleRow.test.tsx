import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// useAutoAdjustEndTimeフックをモック
vi.mock('@/features/plans/hooks/useAutoAdjustEndTime', () => ({
  useAutoAdjustEndTime: (_start: string, _end: string, _onEndChange: () => void) => ({
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
  }),
}));

// ClockTimePickerをモック（入力コンポーネント）
vi.mock('@/components/ui/clock-time-picker', () => ({
  ClockTimePicker: ({
    value,
    onChange,
    disabled,
    hasError,
  }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    hasError?: boolean;
  }) => (
    <input
      data-testid={`time-picker-${value}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={hasError}
    />
  ),
}));

// DatePickerPopoverをモック
vi.mock('@/components/ui/date-picker-popover', () => ({
  DatePickerPopover: ({
    selectedDate,
    onDateChange,
    placeholder,
  }: {
    selectedDate: Date | undefined;
    onDateChange: (d: Date | undefined) => void;
    placeholder: string;
  }) => (
    <button data-testid="date-picker" onClick={() => onDateChange(new Date('2026-02-20'))}>
      {selectedDate ? selectedDate.toISOString().split('T')[0] : placeholder}
    </button>
  ),
}));

// time-utilsをモック
vi.mock('@/lib/time-utils', () => ({
  computeDuration: (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh! * 60 + em! - (sh! * 60 + sm!);
  },
  formatDurationDisplay: (minutes: number) => {
    if (minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  },
}));

import { ScheduleRow } from './ScheduleRow';

describe('ScheduleRow', () => {
  const defaultProps = {
    selectedDate: new Date('2026-02-15'),
    startTime: '09:00',
    endTime: '10:00',
    onDateChange: vi.fn(),
    onStartTimeChange: vi.fn(),
    onEndTimeChange: vi.fn(),
  };

  describe('基本レンダリング', () => {
    it('日付ピッカーが表示される', () => {
      render(<ScheduleRow {...defaultProps} />);
      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('選択中の日付が表示される', () => {
      render(<ScheduleRow {...defaultProps} />);
      expect(screen.getByTestId('date-picker')).toHaveTextContent('2026-02-15');
    });

    it('時刻ピッカーが表示される', () => {
      render(<ScheduleRow {...defaultProps} />);
      expect(screen.getByTestId('time-picker-09:00')).toBeInTheDocument();
      expect(screen.getByTestId('time-picker-10:00')).toBeInTheDocument();
    });

    it('Duration表示が正しい', () => {
      render(<ScheduleRow {...defaultProps} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    it('時間区切りのダッシュが表示される', () => {
      render(<ScheduleRow {...defaultProps} />);
      expect(screen.getByText('–')).toBeInTheDocument();
    });
  });

  describe('日付未選択時', () => {
    it('プレースホルダーが表示される', () => {
      render(<ScheduleRow {...defaultProps} selectedDate={undefined} />);
      // next-intlモックがキーをそのまま返すので
      expect(screen.getByTestId('date-picker')).toHaveTextContent(
        'common.schedule.datePlaceholder',
      );
    });

    it('カスタムプレースホルダーが使用される', () => {
      render(
        <ScheduleRow {...defaultProps} selectedDate={undefined} datePlaceholder="日付を選択" />,
      );
      expect(screen.getByTestId('date-picker')).toHaveTextContent('日付を選択');
    });
  });

  describe('ハンドラー', () => {
    it('日付変更でonDateChangeが呼ばれる', () => {
      const onDateChange = vi.fn();
      render(<ScheduleRow {...defaultProps} onDateChange={onDateChange} />);

      fireEvent.click(screen.getByTestId('date-picker'));
      expect(onDateChange).toHaveBeenCalledWith(new Date('2026-02-20'));
    });

    it('開始時刻変更でonStartTimeChangeが呼ばれる', () => {
      const onStartTimeChange = vi.fn();
      render(<ScheduleRow {...defaultProps} onStartTimeChange={onStartTimeChange} />);

      fireEvent.change(screen.getByTestId('time-picker-09:00'), {
        target: { value: '10:00' },
      });
      expect(onStartTimeChange).toHaveBeenCalledWith('10:00');
    });

    it('終了時刻変更でonEndTimeChangeが呼ばれる', () => {
      const onEndTimeChange = vi.fn();
      render(<ScheduleRow {...defaultProps} onEndTimeChange={onEndTimeChange} />);

      fireEvent.change(screen.getByTestId('time-picker-10:00'), {
        target: { value: '11:00' },
      });
      expect(onEndTimeChange).toHaveBeenCalledWith('11:00');
    });
  });

  describe('disabled状態', () => {
    it('disabledの場合、開始時刻ピッカーが無効化される', () => {
      render(<ScheduleRow {...defaultProps} disabled />);
      expect(screen.getByTestId('time-picker-09:00')).toBeDisabled();
    });
  });

  describe('時間重複エラー', () => {
    it('エラーメッセージが表示される', () => {
      render(<ScheduleRow {...defaultProps} timeConflictError />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('calendar.toast.conflictDescription')).toBeInTheDocument();
    });

    it('エラーなしの場合、エラーメッセージが表示されない', () => {
      render(<ScheduleRow {...defaultProps} timeConflictError={false} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
