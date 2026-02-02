import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Home,
  Info,
  Loader2,
  Mail,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  X,
} from 'lucide-react';

const meta = {
  title: 'Tokens/Icons',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Sizes: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">アイコンサイズ</h1>
      <p className="text-muted-foreground mb-8">lucide-react を使用。size-* でサイズ指定。</p>

      <div className="space-y-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <Settings className="size-3 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-3</code>
            <p className="text-xs text-muted-foreground mt-1">12px</p>
          </div>

          <div className="text-center">
            <Settings className="size-4 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-4</code>
            <p className="text-xs text-muted-foreground mt-1">16px（標準）</p>
          </div>

          <div className="text-center">
            <Settings className="size-5 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-5</code>
            <p className="text-xs text-muted-foreground mt-1">20px</p>
          </div>

          <div className="text-center">
            <Settings className="size-6 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-6</code>
            <p className="text-xs text-muted-foreground mt-1">24px</p>
          </div>

          <div className="text-center">
            <Settings className="size-8 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-8</code>
            <p className="text-xs text-muted-foreground mt-1">32px</p>
          </div>

          <div className="text-center">
            <Settings className="size-10 mx-auto mb-2" />
            <code className="text-xs bg-container px-2 py-1 rounded">size-10</code>
            <p className="text-xs text-muted-foreground mt-1">40px</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">よく使うアイコン</h1>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {[
          { icon: Home, name: 'Home' },
          { icon: Search, name: 'Search' },
          { icon: Settings, name: 'Settings' },
          { icon: User, name: 'User' },
          { icon: Menu, name: 'Menu' },
          { icon: X, name: 'X' },
          { icon: Plus, name: 'Plus' },
          { icon: Edit, name: 'Edit' },
          { icon: Trash2, name: 'Trash2' },
          { icon: Check, name: 'Check' },
          { icon: ChevronDown, name: 'ChevronDown' },
          { icon: ChevronRight, name: 'ChevronRight' },
          { icon: ArrowLeft, name: 'ArrowLeft' },
          { icon: ArrowRight, name: 'ArrowRight' },
          { icon: MoreHorizontal, name: 'MoreHorizontal' },
          { icon: MoreVertical, name: 'MoreVertical' },
          { icon: Calendar, name: 'Calendar' },
          { icon: Clock, name: 'Clock' },
          { icon: Mail, name: 'Mail' },
          { icon: Filter, name: 'Filter' },
          { icon: Eye, name: 'Eye' },
          { icon: EyeOff, name: 'EyeOff' },
          { icon: ExternalLink, name: 'ExternalLink' },
          { icon: Loader2, name: 'Loader2' },
        ].map(({ icon: Icon, name }) => (
          <div key={name} className="text-center">
            <Icon className="size-5 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const SemanticIcons: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">意味を持つアイコン</h1>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-success/10 text-success rounded-full">
            <Check className="size-5" />
          </div>
          <div>
            <p className="font-medium">成功・完了</p>
            <code className="text-xs text-muted-foreground">Check + text-success</code>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-warning/10 text-warning rounded-full">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="font-medium">警告・注意</p>
            <code className="text-xs text-muted-foreground">AlertCircle + text-warning</code>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-destructive/10 text-destructive rounded-full">
            <X className="size-5" />
          </div>
          <div>
            <p className="font-medium">エラー・削除</p>
            <code className="text-xs text-muted-foreground">X + text-destructive</code>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-info/10 text-info rounded-full">
            <Info className="size-5" />
          </div>
          <div>
            <p className="font-medium">情報</p>
            <code className="text-xs text-muted-foreground">Info + text-info</code>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ButtonWithIcon: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">ボタンとアイコン</h1>

      <div className="space-y-8">
        <div>
          <h3 className="font-medium mb-4">テキスト + アイコン</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
              <Plus className="size-4" />
              追加
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-state-hover">
              <Settings className="size-4" />
              設定
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md">
              <Trash2 className="size-4" />
              削除
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">アイコンのみボタン</h3>
          <div className="flex gap-4">
            <button
              className="p-2 rounded-md hover:bg-state-hover"
              aria-label="設定を開く"
            >
              <Settings className="size-4" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-state-hover"
              aria-label="メニューを開く"
            >
              <MoreVertical className="size-4" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-state-hover"
              aria-label="閉じる"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ※ アイコンのみボタンには必ず aria-label を設定
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-4">ローディング</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-70">
            <Loader2 className="size-4 animate-spin" />
            保存中...
          </button>
        </div>
      </div>
    </div>
  ),
};
