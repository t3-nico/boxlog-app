import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, CheckSquare, FileText, History, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function SheetStory() {
    const [rightOpen, setRightOpen] = useState(false);
    const [leftOpen, setLeftOpen] = useState(false);
    const [bottomOpen, setBottomOpen] = useState(false);

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Sheet</h1>
        <p className="text-muted-foreground mb-8">
          画面端からスライドするパネル。モバイルナビゲーション、設定、Inspectorで使用。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">side: right（主要用途）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Inspector、設定パネル。デスクトップでの詳細表示に使用。
            </p>
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 size-4" />
                  設定を開く
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80" aria-label="設定">
                <SheetHeader>
                  <SheetTitle>設定</SheetTitle>
                  <SheetDescription>アプリケーションの設定を変更します。</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="bg-muted h-10 rounded" />
                    <div className="bg-muted h-10 rounded" />
                    <div className="bg-muted h-10 rounded" />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </SheetClose>
                  <Button>保存</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">side: left（ナビゲーション）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              モバイルのサイドメニュー。ハンバーガーメニューから開く。
            </p>
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="メニュー">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" aria-label="ナビゲーション">
                <SheetHeader>
                  <SheetTitle>メニュー</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 p-4">
                  <Button variant="ghost" className="justify-start">
                    <Calendar className="mr-2 size-4" />
                    カレンダー
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <CheckSquare className="mr-2 size-4" />
                    タスク
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Settings className="mr-2 size-4" />
                    設定
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">side: bottom（アクションシート）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              モバイルのアクション選択。FABタップ時の作成メニュー等。
            </p>
            <Sheet open={bottomOpen} onOpenChange={setBottomOpen}>
              <SheetTrigger asChild>
                <Button>作成メニューを開く</Button>
              </SheetTrigger>
              <SheetContent side="bottom" aria-label="作成メニュー">
                <SheetHeader className="px-4 pt-4">
                  <SheetTitle>新規作成</SheetTitle>
                  <SheetDescription>作成するアイテムを選択してください</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 p-4">
                  {[
                    {
                      icon: Calendar,
                      label: '予定を追加',
                      color: 'text-primary',
                      bg: 'bg-muted',
                    },
                    {
                      icon: CheckSquare,
                      label: '実績を記録',
                      color: 'text-success',
                      bg: 'bg-muted',
                    },
                    {
                      icon: FileText,
                      label: 'テンプレートから',
                      color: 'text-muted-foreground',
                      bg: 'bg-muted',
                    },
                    {
                      icon: History,
                      label: '履歴から',
                      color: 'text-warning',
                      bg: 'bg-muted',
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="bg-card hover:bg-state-hover border-border flex items-center gap-4 rounded-2xl border p-4 text-left"
                      onClick={() => setBottomOpen(false)}
                    >
                      <div
                        className={`flex size-12 items-center justify-center rounded-full ${action.bg}`}
                      >
                        <action.icon className={`size-6 ${action.color}`} />
                      </div>
                      <span className="text-foreground font-normal">{action.label}</span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">showCloseButton: false</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              閉じるボタンを非表示。カスタムヘッダーを使用する場合。
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">カスタムヘッダー</Button>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton={false} aria-label="カスタム">
                <div className="flex items-center justify-between p-4">
                  <span className="font-bold">カスタムヘッダー</span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="閉じる">
                      <X className="size-4" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground">コンテンツ領域</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Sheet - ルートコンテナ（状態管理）</li>
                <li>SheetTrigger - 開くトリガー（asChild対応）</li>
                <li>SheetContent - コンテンツ（side: top/right/bottom/left）</li>
                <li>SheetHeader - ヘッダー（Title + Description）</li>
                <li>SheetTitle - タイトル（font-bold）</li>
                <li>SheetDescription - 説明（text-muted-foreground）</li>
                <li>SheetFooter - フッター（アクションボタン配置）</li>
                <li>SheetClose - 閉じるボタン（asChild対応）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>InspectorShell - PC: 右側詳細パネル</li>
              <li>MobileSettingsSheet - モバイル設定</li>
              <li>CreateActionSheet - FAB作成メニュー</li>
              <li>SettingsModal - 設定モーダル</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
