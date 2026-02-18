import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { getTimeZones } from '../utils/timezone-utils';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

// ─────────────────────────────────────────────────────────
// Demo Components
// ─────────────────────────────────────────────────────────

const TIMEZONES = getTimeZones();

function TimezoneSelectDemo() {
  const [timezone, setTimezone] = useState('Asia/Tokyo');

  return (
    <div className="max-w-2xl">
      <SettingsCard title="時間とタイムゾーン">
        <SettingRow label="タイムゾーン">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="時刻形式">
          <Select defaultValue="24h">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24時間 (14:00)</SelectItem>
              <SelectItem value="12h">12時間 (2:00 PM)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="日付形式">
          <Select defaultValue="yyyy/MM/dd">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yyyy/MM/dd">2025/01/22 (日本)</SelectItem>
              <SelectItem value="MM/dd/yyyy">01/22/2025 (US)</SelectItem>
              <SelectItem value="dd/MM/yyyy">22/01/2025 (EU)</SelectItem>
              <SelectItem value="yyyy-MM-dd">2025-01-22 (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>
    </div>
  );
}

function FullCalendarSettingsDemo() {
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [weekStartsOn, setWeekStartsOn] = useState('1');
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);

  return (
    <div className="max-w-2xl space-y-8">
      <SettingsCard title="時間とタイムゾーン">
        <SettingRow label="タイムゾーン">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="時刻形式">
          <Select defaultValue="24h">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24時間 (14:00)</SelectItem>
              <SelectItem value="12h">12時間 (2:00 PM)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="日付形式">
          <Select defaultValue="yyyy/MM/dd">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yyyy/MM/dd">2025/01/22 (日本)</SelectItem>
              <SelectItem value="MM/dd/yyyy">01/22/2025 (US)</SelectItem>
              <SelectItem value="dd/MM/yyyy">22/01/2025 (EU)</SelectItem>
              <SelectItem value="yyyy-MM-dd">2025-01-22 (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="デフォルト表示">
        <SettingRow label="デフォルトビュー">
          <Select defaultValue="week">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日</SelectItem>
              <SelectItem value="3day">3日間</SelectItem>
              <SelectItem value="5day">5日間</SelectItem>
              <SelectItem value="week">週</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="週とカレンダー表示">
        <SettingRow label="週の開始日">
          <Select value={weekStartsOn} onValueChange={setWeekStartsOn}>
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">日曜日</SelectItem>
              <SelectItem value="1">月曜日</SelectItem>
              <SelectItem value="6">土曜日</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="週番号を表示">
          <Switch checked={showWeekNumbers} onCheckedChange={setShowWeekNumbers} />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="勤務時間">
        <SettingRow label="開始">
          <Select defaultValue="9">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {`${i}:00`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="終了">
          <Select defaultValue="18">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {`${i}:00`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <div className="bg-card border-border mt-4 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            営業時間プレビュー: <span className="text-foreground font-normal">9:00 - 18:00</span>
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Timezone List Reference
// ─────────────────────────────────────────────────────────

function TimezoneListReference() {
  return (
    <div className="max-w-2xl">
      <SettingsCard title="対応タイムゾーン一覧 (17ゾーン)">
        <div className="space-y-0">
          {TIMEZONES.map((tz) => (
            <div
              key={tz.value}
              className="border-border flex items-center justify-between border-b px-2 py-2.5 last:border-0"
            >
              <span className="text-foreground text-sm">{tz.label}</span>
              <code className="text-muted-foreground text-xs">{tz.value}</code>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Meta & Stories
// ─────────────────────────────────────────────────────────

const meta = {
  title: 'Features/Settings/CalendarSettings',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** タイムゾーンセレクター（17ゾーン対応） */
export const TimezoneSelector: Story = {
  render: () => <TimezoneSelectDemo />,
};

/** カレンダー設定全体 */
export const AllSections: Story = {
  render: () => <FullCalendarSettingsDemo />,
};

/** 対応タイムゾーン一覧（リファレンス） */
export const TimezoneList: Story = {
  render: () => <TimezoneListReference />,
};
