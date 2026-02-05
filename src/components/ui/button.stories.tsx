import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Settings, Trash2, X } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon-sm', 'icon', 'icon-lg'],
      description: 'ボタンのサイズ',
    },
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ラベル',
    variant: 'primary',
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div style={{ maxWidth: '48rem' }}>
        <h1 className="mb-2 text-2xl font-bold">Button</h1>
        <p className="text-muted-foreground mb-8">
          Material Design 3 の階層に基づいたボタンバリアント。
        </p>

        {/* バリアント階層 */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">バリアント階層（M3準拠）</h2>
          <div className="bg-container space-y-4 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Button variant="primary" className="w-28">
                primary
              </Button>
              <div className="text-sm">
                <span className="font-medium">高強調</span>
                <span className="text-muted-foreground ml-2">
                  画面の主目的を達成するアクション（1画面に1つが理想）
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="w-28">
                outline
              </Button>
              <div className="text-sm">
                <span className="font-medium">中強調</span>
                <span className="text-muted-foreground ml-2">primaryの代替・補助アクション</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="w-28">
                ghost
              </Button>
              <div className="text-sm">
                <span className="font-medium">低強調</span>
                <span className="text-muted-foreground ml-2">最も控えめ、補助的なアクション</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="destructive" className="w-28">
                destructive
              </Button>
              <div className="text-sm">
                <span className="font-medium">破壊的</span>
                <span className="text-muted-foreground ml-2">削除、解除など取り消せない操作</span>
              </div>
            </div>
          </div>
        </section>

        {/* 使い分けガイド */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">使い分けガイド</h2>
          <div className="space-y-6">
            {/* primary の例 */}
            <div>
              <h3 className="mb-2 font-medium">primary を使う場面</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">保存</Button>
                <Button variant="primary">送信</Button>
                <Button variant="primary">作成</Button>
                <Button variant="primary">次へ</Button>
                <Button variant="primary">完了</Button>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                「このボタンを押すことが画面の目的」となるアクション
              </p>
            </div>

            {/* outline の例 */}
            <div>
              <h3 className="mb-2 font-medium">outline を使う場面</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">キャンセル</Button>
                <Button variant="outline">戻る</Button>
                <Button variant="outline">詳細を見る</Button>
                <Button variant="outline">編集</Button>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                重要だが主目的ではない、primaryとペアで使う
              </p>
            </div>

            {/* ghost の例 */}
            <div>
              <h3 className="mb-2 font-medium">ghost を使う場面</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="閉じる">
                  <X className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="設定">
                  <Settings className="size-4" />
                </Button>
                <Button variant="ghost">もっと見る</Button>
                <Button variant="ghost">スキップ</Button>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                アイコンボタン、ツールバー、控えめなテキストリンク
              </p>
            </div>
          </div>
        </section>

        {/* ダイアログでの使い分け */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">ダイアログでの使い分け</h2>
          <div className="space-y-4">
            {/* 通常の確認 */}
            <div className="bg-container rounded-lg p-4">
              <p className="text-muted-foreground mb-3 text-sm">通常の確認ダイアログ</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost">キャンセル</Button>
                <Button variant="primary">保存</Button>
              </div>
            </div>

            {/* 破壊的アクション */}
            <div className="bg-container rounded-lg p-4">
              <p className="text-muted-foreground mb-3 text-sm">
                破壊的アクション（削除など）- 安全な選択肢を強調
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline">キャンセル</Button>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  削除
                </Button>
              </div>
            </div>

            {/* 同等の選択肢 */}
            <div className="bg-container rounded-lg p-4">
              <p className="text-muted-foreground mb-3 text-sm">同等の選択肢</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline">後で</Button>
                <Button variant="outline">今すぐ</Button>
              </div>
            </div>
          </div>
        </section>

        {/* サイズ */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">サイズ</h2>
          <div className="bg-container space-y-4 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Button variant="primary" size="sm" className="w-24">
                sm
              </Button>
              <span className="text-muted-foreground text-sm">32px - コンパクトUI、ツールバー</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="primary" size="default" className="w-24">
                default
              </Button>
              <span className="text-muted-foreground text-sm">36px - 標準的なアクション</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="primary" size="lg" className="w-24">
                lg
              </Button>
              <span className="text-muted-foreground text-sm">
                44px - CTA、モバイル主要アクション（Apple HIG準拠）
              </span>
            </div>
          </div>
        </section>

        {/* アイコンボタン */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">アイコンボタン</h2>
          <div className="bg-container space-y-4 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon-sm" aria-label="追加">
                <Plus className="size-4" />
              </Button>
              <span className="text-muted-foreground text-sm">icon-sm (32px) - コンパクト</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" aria-label="設定">
                <Settings className="size-4" />
              </Button>
              <span className="text-muted-foreground text-sm">icon (36px) - 標準</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon-lg" aria-label="閉じる">
                <X className="size-5" />
              </Button>
              <span className="text-muted-foreground text-sm">
                icon-lg (44px) - ナビゲーション、モバイル
              </span>
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            ※ icon-sm, icon はタップターゲット44pxを疑似要素で確保（WCAG準拠）
          </p>
        </section>

        {/* 状態 */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold">状態</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-center">
              <Button isLoading>保存中</Button>
              <p className="text-muted-foreground mt-1 text-xs">isLoading</p>
            </div>
            <div className="text-center">
              <Button isLoading loadingText="処理中...">
                保存
              </Button>
              <p className="text-muted-foreground mt-1 text-xs">loadingText</p>
            </div>
            <div className="text-center">
              <Button disabled>無効</Button>
              <p className="text-muted-foreground mt-1 text-xs">disabled</p>
            </div>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
