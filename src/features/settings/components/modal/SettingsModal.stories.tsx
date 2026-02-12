import { useEffect } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Camera } from 'lucide-react';

import { useSettingsModalStore } from '../../stores/useSettingsModalStore';
import type { SettingsCategory } from '../../types';
import { SettingsCard } from '../SettingsCard';
import { SettingRow } from '../fields/SettingRow';
import { SettingsModalSidebar } from './SettingsModalSidebar';

// ─────────────────────────────────────────────────────────
// Mock Content per Category
// ─────────────────────────────────────────────────────────

const MOCK_CONTENT: Record<SettingsCategory, React.ReactNode> = {
  general: (
    <>
      <SettingsCard title="基本設定">
        <SettingRow label="言語">
          <Select defaultValue="ja">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="タイムゾーン">
          <span className="text-muted-foreground">Asia/Tokyo (UTC+9)</span>
        </SettingRow>
        <SettingRow label="日付形式">
          <span className="text-muted-foreground">YYYY-MM-DD</span>
        </SettingRow>
        <SettingRow label="時刻形式">
          <Switch defaultChecked />
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="外観">
        <SettingRow label="テーマ">
          <Select defaultValue="system">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">システム</SelectItem>
              <SelectItem value="light">ライト</SelectItem>
              <SelectItem value="dark">ダーク</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="コンパクトモード">
          <Switch />
        </SettingRow>
      </SettingsCard>
    </>
  ),
  calendar: (
    <>
      <SettingsCard title="カレンダー">
        <SettingRow label="週の開始日">
          <Select defaultValue="monday">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">月曜日</SelectItem>
              <SelectItem value="sunday">日曜日</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="デフォルト表示">
          <Select defaultValue="week">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日</SelectItem>
              <SelectItem value="week">週</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="週末を表示">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="週番号を表示">
          <Switch />
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="勤務時間">
        <SettingRow label="開始">
          <span className="text-muted-foreground">09:00</span>
        </SettingRow>
        <SettingRow label="終了">
          <span className="text-muted-foreground">18:00</span>
        </SettingRow>
      </SettingsCard>
    </>
  ),
  personalization: (
    <SettingsCard title="クロノタイプ">
      <SettingRow label="睡眠時間">
        <span className="text-muted-foreground">23:00 - 07:00</span>
      </SettingRow>
      <SettingRow label="ピーク時間帯">
        <span className="text-muted-foreground">10:00 - 12:00</span>
      </SettingRow>
      <SettingRow label="低エネルギー時間帯">
        <span className="text-muted-foreground">14:00 - 15:00</span>
      </SettingRow>
    </SettingsCard>
  ),
  notifications: (
    <>
      <SettingsCard title="通知">
        <SettingRow label="プッシュ通知">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="メール通知">
          <Switch />
        </SettingRow>
        <SettingRow label="サウンド">
          <Switch defaultChecked />
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="リマインダー">
        <SettingRow label="プランリマインダー">
          <span className="text-muted-foreground">15分前</span>
        </SettingRow>
        <SettingRow label="デイリーサマリー">
          <span className="text-muted-foreground">08:00</span>
        </SettingRow>
      </SettingsCard>
    </>
  ),
  'data-controls': (
    <SettingsCard title="データ管理">
      <SettingRow label="データエクスポート">
        <span className="text-muted-foreground">CSV / JSON</span>
      </SettingRow>
      <SettingRow label="データインポート">
        <span className="text-muted-foreground">ファイルを選択</span>
      </SettingRow>
      <SettingRow label="全データ削除">
        <Button variant="destructive" size="sm">
          削除
        </Button>
      </SettingRow>
    </SettingsCard>
  ),
  integrations: (
    <SettingsCard title="連携サービス">
      <SettingRow label="Google カレンダー" description="未接続">
        <Button variant="outline" size="sm">
          接続
        </Button>
      </SettingRow>
      <SettingRow label="Apple カレンダー" description="未接続">
        <Button variant="outline" size="sm">
          接続
        </Button>
      </SettingRow>
    </SettingsCard>
  ),
  account: (
    <>
      <SettingsCard title="プロフィール">
        <div className="mb-4">
          <div className="text-foreground mb-2 text-base">プロフィール画像</div>
          <button
            type="button"
            className="group relative cursor-pointer"
            aria-label="プロフィール画像"
          >
            <Avatar size="xl">
              <AvatarFallback>TA</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
              <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        </div>
        <SettingRow label="表示名" description="takayasu">
          <Button variant="outline" size="sm">
            変更
          </Button>
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="アカウント">
        <SettingRow label="メールアドレス" description="user@example.com">
          <Button variant="outline" size="sm">
            変更
          </Button>
        </SettingRow>
        <SettingRow label="パスワード" description="••••••••">
          <Button variant="outline" size="sm">
            変更
          </Button>
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="危険な操作">
        <SettingRow label="アカウント削除">
          <Button variant="destructive" size="sm">
            アカウントを削除
          </Button>
        </SettingRow>
      </SettingsCard>
    </>
  ),
  subscription: (
    <SettingsCard title="プラン・お支払い">
      <SettingRow label="現在のプラン" description="Free">
        <Button variant="outline" size="sm">
          アップグレード
        </Button>
      </SettingRow>
      <SettingRow label="請求サイクル">
        <span className="text-muted-foreground">—</span>
      </SettingRow>
      <SettingRow label="次回支払い">
        <span className="text-muted-foreground">—</span>
      </SettingRow>
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
