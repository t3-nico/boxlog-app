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
import { expect, userEvent, within } from 'storybook/test';

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
    <>
      <SettingsCard title="価値評定スケール">
        <div className="space-y-4">
          {[
            { label: '健康', desc: '食事・睡眠・運動', importance: 10 },
            { label: 'キャリア・仕事', desc: '集中時間の確保', importance: 9 },
            { label: '家族', desc: '家族の絆は安心感の土台', importance: 8 },
          ].map((cat) => (
            <div key={cat.label} className="border-border rounded-2xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-foreground text-sm font-normal">{cat.label}</h4>
                  <p className="text-muted-foreground text-xs">{cat.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`size-3 rounded-full ${i < cat.importance ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <p className="text-muted-foreground text-center text-xs">+ 9 more categories</p>
        </div>
      </SettingsCard>
      <SettingsCard title="価値観キーワードランキング">
        <div className="text-muted-foreground mb-2 text-xs">5 / 10 選択中</div>
        <div className="space-y-1">
          {['誠実さ', '好奇心', '規律', '成長', 'バランス'].map((label, i) => (
            <div
              key={label}
              className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <span className="text-muted-foreground w-5 text-right text-sm">{i + 1}</span>
              <span className="text-foreground flex-1 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="クロノタイプ">
        <SettingRow label="睡眠時間">
          <span className="text-muted-foreground">23:00 - 07:00</span>
        </SettingRow>
        <SettingRow label="ピーク時間帯">
          <span className="text-muted-foreground">10:00 - 12:00</span>
        </SettingRow>
      </SettingsCard>
    </>
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
    <>
      <SettingsCard title="データエクスポート">
        <div className="bg-surface-container rounded-2xl p-4">
          <h4 className="mb-2 text-sm font-normal">エクスポート対象</h4>
          <ul className="text-muted-foreground grid grid-cols-2 gap-1 text-sm">
            <li>• プロフィール</li>
            <li>• プラン・タスク</li>
            <li>• 時間記録</li>
            <li>• タグ設定</li>
            <li>• 通知設定</li>
            <li>• カレンダー設定</li>
          </ul>
        </div>
        <div className="mt-4">
          <Button className="w-full">JSONでエクスポート</Button>
        </div>
      </SettingsCard>
      <SettingsCard title="データインポート">
        <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8">
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </div>
      </SettingsCard>
    </>
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
  play: async () => {
    // 設定モーダルはポータル経由でレンダリング
    const body = within(document.body);

    // General カテゴリが表示されていることを確認
    await expect(body.getByText('基本設定')).toBeInTheDocument();

    // サイドバーで別カテゴリに切り替え
    const calendarLink = body.getByText('カレンダー');
    await userEvent.click(calendarLink);

    // カレンダーカテゴリのコンテンツが表示される
    await expect(body.getByText('週の開始日')).toBeInTheDocument();
  },
};

/** Calendar カテゴリ */
export const Calendar: Story = {
  render: () => <SettingsModalShell initialCategory="calendar" />,
};

/** Notifications カテゴリ */
export const Notifications: Story = {
  render: () => <SettingsModalShell initialCategory="notifications" />,
};

/** Data Controls カテゴリ */
export const DataControls: Story = {
  render: () => <SettingsModalShell initialCategory="data-controls" />,
};

/** Account カテゴリ */
export const Account: Story = {
  render: () => <SettingsModalShell initialCategory="account" />,
};
