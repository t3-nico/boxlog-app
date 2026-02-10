'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown } from 'lucide-react';

import { useSettingsModalStore } from '../../stores/useSettingsModalStore';
import type { SettingsCategory } from '../../types';
import { SettingsCard } from '../SettingsCard';
import { SettingRow } from '../fields/SettingRow';
import { SettingsModalSidebar } from './SettingsModalSidebar';

// ─────────────────────────────────────────────────────────
// Mock Content per Category
// ─────────────────────────────────────────────────────────

// バリュー + ChevronDown のドロップダウン風表示（ChatGPT設定画面スタイル）
function DropdownValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      <ChevronDown className="text-muted-foreground size-3.5" />
    </span>
  );
}

const MOCK_CONTENT: Record<SettingsCategory, React.ReactNode> = {
  general: (
    <>
      <SettingsCard title="基本設定">
        <SettingRow label="言語" value={<DropdownValue>日本語</DropdownValue>} />
        <SettingRow label="タイムゾーン" value="Asia/Tokyo (UTC+9)" />
        <SettingRow label="日付形式" value="YYYY-MM-DD" />
        <SettingRow label="時刻形式" value="24時間" action={<Switch defaultChecked />} />
      </SettingsCard>
      <SettingsCard title="外観">
        <SettingRow label="テーマ" value={<DropdownValue>システム</DropdownValue>} />
        <SettingRow label="コンパクトモード" value="" action={<Switch />} />
      </SettingsCard>
    </>
  ),
  calendar: (
    <>
      <SettingsCard title="カレンダー">
        <SettingRow label="週の開始日" value={<DropdownValue>月曜日</DropdownValue>} />
        <SettingRow label="デフォルト表示" value={<DropdownValue>週</DropdownValue>} />
        <SettingRow label="週末を表示" value="" action={<Switch defaultChecked />} />
        <SettingRow label="週番号を表示" value="" action={<Switch />} />
      </SettingsCard>
      <SettingsCard title="勤務時間">
        <SettingRow label="開始" value={<DropdownValue>09:00</DropdownValue>} />
        <SettingRow label="終了" value={<DropdownValue>18:00</DropdownValue>} />
      </SettingsCard>
    </>
  ),
  personalization: (
    <SettingsCard title="クロノタイプ">
      <SettingRow label="睡眠時間" value="23:00 - 07:00" />
      <SettingRow label="ピーク時間帯" value="10:00 - 12:00" />
      <SettingRow label="低エネルギー時間帯" value="14:00 - 15:00" />
    </SettingsCard>
  ),
  notifications: (
    <>
      <SettingsCard title="通知">
        <SettingRow label="プッシュ通知" value="" action={<Switch defaultChecked />} />
        <SettingRow label="メール通知" value="" action={<Switch />} />
        <SettingRow label="サウンド" value="" action={<Switch defaultChecked />} />
      </SettingsCard>
      <SettingsCard title="リマインダー">
        <SettingRow label="プランリマインダー" value={<DropdownValue>15分前</DropdownValue>} />
        <SettingRow label="デイリーサマリー" value={<DropdownValue>08:00</DropdownValue>} />
      </SettingsCard>
    </>
  ),
  'data-controls': (
    <SettingsCard title="データ管理">
      <SettingRow label="データエクスポート" value={<DropdownValue>CSV / JSON</DropdownValue>} />
      <SettingRow label="データインポート" value={<DropdownValue>ファイルを選択</DropdownValue>} />
      <SettingRow
        label="全データ削除"
        value=""
        action={
          <Button variant="destructive" size="sm">
            削除
          </Button>
        }
      />
    </SettingsCard>
  ),
  integrations: (
    <SettingsCard title="連携サービス">
      <SettingRow
        label="Google カレンダー"
        value="未接続"
        action={
          <Button variant="ghost" size="sm">
            接続
          </Button>
        }
      />
      <SettingRow
        label="Apple カレンダー"
        value="未接続"
        action={
          <Button variant="ghost" size="sm">
            接続
          </Button>
        }
      />
    </SettingsCard>
  ),
  account: (
    <>
      <SettingsCard title="アカウント">
        <SettingRow label="メールアドレス" value="user@example.com" />
        <SettingRow
          label="パスワード"
          value="••••••••"
          action={
            <Button variant="ghost" size="sm">
              変更
            </Button>
          }
        />
      </SettingsCard>
      <SettingsCard title="危険な操作">
        <SettingRow
          label="アカウント削除"
          value=""
          action={
            <Button variant="destructive" size="sm">
              アカウントを削除
            </Button>
          }
        />
      </SettingsCard>
    </>
  ),
  subscription: (
    <SettingsCard title="プラン・お支払い">
      <SettingRow
        label="現在のプラン"
        value="Free"
        action={
          <Button variant="ghost" size="sm">
            アップグレード
          </Button>
        }
      />
      <SettingRow label="請求サイクル" value="—" />
      <SettingRow label="次回支払い" value="—" />
    </SettingsCard>
  ),
};

// ─────────────────────────────────────────────────────────
// Mock Content Area
// ─────────────────────────────────────────────────────────

function MockSettingsContent() {
  const selectedCategory = useSettingsModalStore((state) => state.selectedCategory);

  return (
    <div className="bg-background flex h-full min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-auto p-6">
        {MOCK_CONTENT[selectedCategory]}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Story Shell
// ─────────────────────────────────────────────────────────

function SettingsModalShell({ initialCategory }: { initialCategory?: SettingsCategory }) {
  useEffect(() => {
    useSettingsModalStore.setState({
      isOpen: true,
      selectedCategory: initialCategory ?? 'general',
    });
    return () => {
      useSettingsModalStore.setState({ isOpen: false });
    };
  }, [initialCategory]);

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="flex h-[85vh] max-h-[800px] max-w-4xl gap-0 overflow-hidden p-0"
        showCloseButton={true}
      >
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>
        <SettingsModalSidebar className="border-border w-60 shrink-0 border-r" />
        <MockSettingsContent />
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────────────────

const meta = {
  title: 'Features/Settings/SettingsModal',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** デフォルト（General カテゴリ） */
export const Default: Story = {
  render: () => <SettingsModalShell />,
};

/** Calendar カテゴリ */
export const Calendar: Story = {
  render: () => <SettingsModalShell initialCategory="calendar" />,
};

/** Notifications カテゴリ */
export const Notifications: Story = {
  render: () => <SettingsModalShell initialCategory="notifications" />,
};

/** Account カテゴリ */
export const Account: Story = {
  render: () => <SettingsModalShell initialCategory="account" />,
};
