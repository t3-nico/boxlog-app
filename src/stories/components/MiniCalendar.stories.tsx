import type { Meta, StoryObj } from '@storybook/react';
import { addDays } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { MiniCalendar } from '@/components/ui/mini-calendar';

const meta = {
  title: 'Components/MiniCalendar',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function CalendarWithState({ initialDate }: { initialDate?: Date }) {
  const [selected, setSelected] = useState<Date | undefined>(initialDate);

  return (
    <div className="space-y-4">
      <div className="bg-card border-border rounded-xl border">
        <MiniCalendar selectedDate={selected} onDateSelect={setSelected} />
      </div>
      <p className="text-muted-foreground text-center text-xs">
        選択中: {selected ? selected.toLocaleDateString('ja-JP') : 'なし'}
      </p>
    </div>
  );
}

/**
 * 基本形。日付を選択するとハイライトされる。
 */
export const Default: Story = {
  render: () => <CalendarWithState />,
};

/**
 * 初期値として今日が選択された状態。
 */
export const WithSelectedDate: Story = {
  render: () => <CalendarWithState initialDate={new Date()} />,
};

/**
 * displayRange で週の範囲をハイライト。
 * サイドバーのミニカレンダーで使用。
 */
export const WithRange: Story = {
  render: () => {
    const today = new Date();
    const rangeStart = today;
    const rangeEnd = addDays(today, 6);

    return (
      <div className="bg-card border-border rounded-xl border">
        <MiniCalendar displayRange={{ start: rangeStart, end: rangeEnd }} />
      </div>
    );
  },
};

function PopoverExample() {
  const [selected, setSelected] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <MiniCalendar
        asPopover
        selectedDate={selected}
        onDateSelect={setSelected}
        popoverTrigger={
          <Button variant="outline" className="gap-2">
            <CalendarDays className="size-4" />
            {selected ? selected.toLocaleDateString('ja-JP') : '日付を選択'}
          </Button>
        }
      />
      <p className="text-muted-foreground text-center text-xs">
        選択中: {selected ? selected.toLocaleDateString('ja-JP') : 'なし'}
      </p>
    </div>
  );
}

/**
 * Popoverモード。トリガーをクリックするとカレンダーが表示される。
 * フォーム内での日付選択に使用。
 */
export const AsPopover: Story = {
  render: () => <PopoverExample />,
};
