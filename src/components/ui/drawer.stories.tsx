import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, CheckSquare, FileText, History } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function DrawerStory() {
    const [basicOpen, setBasicOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [snapOpen, setSnapOpen] = useState(false);

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Drawer</h1>
        <p className="text-muted-foreground mb-8">
          モバイル用ボトムシート。vaul使用。スワイプで閉じる、スナップポイント対応。
        </p>

        <div className="grid max-w-3xl gap-8">
          <div>
            <h2 className="mb-2 text-lg font-bold">基本形（bottom）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              下からスライド。ドラッグハンドル付き。モバイルメニューで使用。
            </p>
            <Drawer open={basicOpen} onOpenChange={setBasicOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline">Drawerを開く</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-center">
                  <DrawerTitle>設定</DrawerTitle>
                  <DrawerDescription>アプリケーションの設定を変更します。</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="bg-muted h-10 rounded" />
                    <div className="bg-muted h-10 rounded" />
                    <div className="bg-muted h-10 rounded" />
                  </div>
                </div>
                <DrawerFooter>
                  <Button>保存</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">アクションシート（CreateActionSheet）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              FABタップ時の作成メニュー。Material Design 3のBottom Sheetパターン。
            </p>
            <Drawer open={actionOpen} onOpenChange={setActionOpen}>
              <DrawerTrigger asChild>
                <Button>作成メニューを開く</Button>
              </DrawerTrigger>
              <DrawerContent className="pb-safe-area-inset-bottom">
                <DrawerHeader className="text-center">
                  <DrawerTitle>新規作成</DrawerTitle>
                  <DrawerDescription>作成するアイテムを選択してください</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-2 px-4 pb-6">
                  {[
                    {
                      icon: Calendar,
                      label: '予定を追加',
                      description: 'カレンダーに予定を追加',
                      color: 'text-primary',
                      bg: 'bg-muted',
                    },
                    {
                      icon: CheckSquare,
                      label: '実績を記録',
                      description: '完了したタスクを記録',
                      color: 'text-success',
                      bg: 'bg-muted',
                    },
                    {
                      icon: FileText,
                      label: 'テンプレートから',
                      description: 'テンプレートを使用',
                      color: 'text-muted-foreground',
                      bg: 'bg-muted',
                    },
                    {
                      icon: History,
                      label: '履歴から',
                      description: '最近の項目から再作成',
                      color: 'text-warning',
                      bg: 'bg-muted',
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="bg-card hover:bg-state-hover border-border flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors active:scale-[0.98]"
                      onClick={() => setActionOpen(false)}
                    >
                      <div
                        className={`flex size-12 items-center justify-center rounded-full ${action.bg}`}
                      >
                        <action.icon className={`size-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-normal">{action.label}</p>
                        <p className="text-muted-foreground text-sm">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">スナップポイント（Inspector）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              50%→97%の2段階。上スワイプで全画面化。InspectorShellで使用。
            </p>
            <Drawer
              open={snapOpen}
              onOpenChange={setSnapOpen}
              snapPoints={[0.5, 0.97]}
              fadeFromIndex={1}
            >
              <DrawerTrigger asChild>
                <Button variant="outline">Inspectorを開く</Button>
              </DrawerTrigger>
              <DrawerContent className="flex flex-col gap-0 overflow-hidden p-0">
                <DrawerTitle className="sr-only">詳細パネル</DrawerTitle>
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="mb-4 font-bold">プランの詳細</h3>
                  <div className="space-y-4">
                    <div className="bg-muted h-20 rounded" />
                    <div className="bg-muted h-20 rounded" />
                    <div className="bg-muted h-20 rounded" />
                    <div className="bg-muted h-20 rounded" />
                    <div className="bg-muted h-20 rounded" />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Sheet vs Drawer</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>Sheet</strong>: Radix UI Dialog。4方向対応（top/right/bottom/left）
                </li>
                <li>
                  <strong>Drawer</strong>: vaul。スワイプジェスチャー、スナップポイント対応
                </li>
                <li>
                  <strong>使い分け</strong>: モバイルのボトムシート=Drawer、それ以外=Sheet
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Drawer - ルートコンテナ（vaul使用）</li>
                <li>DrawerTrigger - 開くトリガー（asChild対応）</li>
                <li>DrawerContent - コンテンツ（自動ドラッグハンドル付き）</li>
                <li>DrawerHeader - ヘッダー（Title + Description）</li>
                <li>DrawerTitle - タイトル（font-bold）</li>
                <li>DrawerDescription - 説明（text-muted-foreground）</li>
                <li>DrawerFooter - フッター</li>
                <li>DrawerClose - 閉じるボタン（asChild対応）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>InspectorShell - モバイル詳細パネル（スナップポイント付き）</li>
              <li>CreateActionSheet - FAB作成メニュー</li>
              <li>MobileLayout - モバイルナビゲーション</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
