import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { MiniCalendar } from '@/components/ui/mini-calendar';

const meta = {
  title: 'Components/MiniCalendar',
  component: MiniCalendar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    asPopover: {
      control: 'boolean',
      description: 'Popoverモードで表示',
    },
    allowClear: {
      control: 'boolean',
      description: '「日付なし」ボタンを表示するか',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MiniCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

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

/** 基本形。日付を選択するとハイライトされる。 */
export const Default: Story = {
  render: () => <CalendarWithState />,
};

/** 初期値として今日が選択された状態。 */
export const WithSelectedDate: Story = {
  render: () => <CalendarWithState initialDate={new Date()} />,
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

/** Popoverモード。トリガーをクリックするとカレンダーが表示される。フォーム内での日付選択に使用。 */
export const AsPopover: Story = {
  render: () => <PopoverExample />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [selected1, setSelected1] = useState<Date | undefined>();
    const [selected2, setSelected2] = useState<Date | undefined>(new Date());
    const [popoverDate, setPopoverDate] = useState<Date | undefined>();

    return (
      <div className="flex flex-col items-start gap-6">
        <div className="bg-card border-border rounded-xl border">
          <MiniCalendar selectedDate={selected1} onDateSelect={setSelected1} />
        </div>
        <div className="bg-card border-border rounded-xl border">
          <MiniCalendar selectedDate={selected2} onDateSelect={setSelected2} />
        </div>
        <MiniCalendar
          asPopover
          selectedDate={popoverDate}
          onDateSelect={setPopoverDate}
          popoverTrigger={
            <Button variant="outline" className="gap-2">
              <CalendarDays className="size-4" />
              {popoverDate ? popoverDate.toLocaleDateString('ja-JP') : '日付を選択'}
            </Button>
          }
        />
      </div>
    );
  },
};
