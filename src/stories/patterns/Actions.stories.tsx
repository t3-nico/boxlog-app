import type { Meta, StoryObj } from '@storybook/react';
import {
  ChevronDown,
  Copy,
  Edit,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Share,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const meta = {
  title: 'Patterns/Actions',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Action Patterns</h1>
      <p className="text-muted-foreground mb-8">
        アクションUIのパターン。ボタン、メニュー、コンテキストメニューの使い分け。
      </p>

      <div className="grid max-w-5xl gap-8">
        {/* 使い分けガイド */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">使い分けガイド</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-3 text-left font-bold">パターン</th>
                  <th className="py-3 text-left font-bold">用途</th>
                  <th className="py-3 text-left font-bold">トリガー</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Primary Button</td>
                  <td className="py-3">主要アクション（保存、作成）</td>
                  <td className="py-3">常時表示</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Secondary Button</td>
                  <td className="py-3">副次アクション（キャンセル）</td>
                  <td className="py-3">常時表示</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Dropdown Menu</td>
                  <td className="py-3">複数の関連アクション</td>
                  <td className="py-3">ボタンクリック</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Context Menu</td>
                  <td className="py-3">要素固有のアクション</td>
                  <td className="py-3">右クリック</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">Split Button</td>
                  <td className="py-3">デフォルト＋追加オプション</td>
                  <td className="py-3">ボタン/矢印クリック</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* プライマリアクション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">プライマリアクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            画面で最も重要なアクション。1つだけ配置。
          </p>

          <div className="flex flex-wrap gap-4">
            <Button>
              <Plus className="mr-2 size-4" />
              新規作成
            </Button>
            <Button>保存</Button>
            <Button>送信</Button>
          </div>

          <div className="bg-container mt-4 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-bold">配置ルール</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>画面上部右寄せ、またはフォーム下部</li>
              <li>1画面に1つのプライマリアクション</li>
              <li>アイコン＋ラベルで明確に</li>
            </ul>
          </div>
        </section>

        {/* ドロップダウンメニュー */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ドロップダウンメニュー</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            複数の関連アクションをグループ化。ボタンクリックで展開。
          </p>

          <div className="flex flex-wrap gap-4">
            {/* アイコンボタン（テーブル行など） */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">アイコンボタン</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 size-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 size-4" />
                    複製
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="mr-2 size-4" />
                    共有
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 縦三点 */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">縦三点</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>設定</DropdownMenuItem>
                  <DropdownMenuItem>ヘルプ</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>ログアウト</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* テキスト付き */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-bold">テキスト付き</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    アクション
                    <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>エクスポート</DropdownMenuItem>
                  <DropdownMenuItem>インポート</DropdownMenuItem>
                  <DropdownMenuItem>アーカイブ</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="size-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <Edit className="mr-2 size-4" />
      編集
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      削除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
          </pre>
        </section>

        {/* コンテキストメニュー */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">コンテキストメニュー</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            右クリックで展開。要素固有のアクション。
          </p>

          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="border-border bg-muted flex h-32 cursor-context-menu items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-sm">右クリックしてメニューを表示</p>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <Edit className="mr-2 size-4" />
                編集
                <ContextMenuShortcut>⌘E</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>
                <Copy className="mr-2 size-4" />
                コピー
                <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>
                <Share className="mr-2 size-4" />
                共有
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                削除
                <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<ContextMenu>
  <ContextMenuTrigger>
    <div>右クリック対象の要素</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      編集
      <ContextMenuShortcut>⌘E</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
          </pre>
        </section>

        {/* スプリットボタン */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">スプリットボタン</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            デフォルトアクション＋追加オプション。頻繁に使うアクションを素早く実行。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="inline-flex">
              <Button className="rounded-r-none">保存</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-l-none border-l-0 px-2">
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>下書きとして保存</DropdownMenuItem>
                  <DropdownMenuItem>テンプレートとして保存</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="inline-flex">
              <Button variant="outline" className="rounded-r-none">
                エクスポート
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-l-none border-l-0 px-2">
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>CSV形式</DropdownMenuItem>
                  <DropdownMenuItem>JSON形式</DropdownMenuItem>
                  <DropdownMenuItem>PDF形式</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="inline-flex">
  <Button className="rounded-r-none">
    保存
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="rounded-l-none border-l-0 px-2">
        <ChevronDown className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>下書きとして保存</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>`}
          </pre>
        </section>

        {/* 一括アクション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">一括アクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            複数選択時に表示されるアクションバー。
          </p>

          <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-3">
            <span className="text-sm font-medium">3件を選択中</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                タグを追加
              </Button>
              <Button variant="outline" size="sm">
                移動
              </Button>
              <Button variant="destructive" size="sm">
                削除
              </Button>
            </div>
          </div>

          <div className="bg-container mt-4 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-bold">表示ルール</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>1件以上選択時にのみ表示</li>
              <li>選択件数を明示</li>
              <li>破壊的アクションは右端に配置</li>
              <li>選択解除ボタンを提供</li>
            </ul>
          </div>
        </section>

        {/* キーボードショートカット */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">キーボードショートカット</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            メニュー項目にショートカットを表示。パワーユーザー向け。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-3 text-left font-bold">アクション</th>
                  <th className="py-3 text-left font-bold">ショートカット</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="py-3">新規作成</td>
                  <td className="py-3">
                    <kbd className="bg-muted rounded px-2 py-1 text-xs">⌘N</kbd>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">保存</td>
                  <td className="py-3">
                    <kbd className="bg-muted rounded px-2 py-1 text-xs">⌘S</kbd>
                  </td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3">削除</td>
                  <td className="py-3">
                    <kbd className="bg-muted rounded px-2 py-1 text-xs">⌘⌫</kbd>
                  </td>
                </tr>
                <tr>
                  <td className="py-3">検索</td>
                  <td className="py-3">
                    <kbd className="bg-muted rounded px-2 py-1 text-xs">⌘K</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ベストプラクティス */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ベストプラクティス</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-success space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Do</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>破壊的アクションは視覚的に区別</li>
                <li>頻繁に使うアクションにショートカット</li>
                <li>関連アクションはグループ化</li>
                <li>アイコン＋ラベルで明確に</li>
              </ul>
            </div>
            <div className="border-destructive space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Don&apos;t</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>メニュー項目が10個以上</li>
                <li>削除を最上部に配置</li>
                <li>確認なしの破壊的アクション</li>
                <li>アイコンだけで意味が伝わらない</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
