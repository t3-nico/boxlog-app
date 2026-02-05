import type { Meta, StoryObj } from '@storybook/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LayoutGrid,
  List,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const meta = {
  title: 'Patterns/Navigation',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Navigation Patterns</h1>
      <p className="text-muted-foreground mb-8">
        ナビゲーションUIのパターン。タブ、ブレッドクラム、ページネーションの使い分け。
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
                  <th className="py-3 text-left font-bold">推奨項目数</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Tabs</td>
                  <td className="py-3">同一ページ内のセクション切り替え</td>
                  <td className="py-3">2〜5個</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Breadcrumbs</td>
                  <td className="py-3">階層構造の現在位置表示</td>
                  <td className="py-3">2〜4階層</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">Segmented Control</td>
                  <td className="py-3">表示モードの切り替え</td>
                  <td className="py-3">2〜4個</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">Stepper</td>
                  <td className="py-3">複数ステップのフロー</td>
                  <td className="py-3">3〜5ステップ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* タブナビゲーション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">タブナビゲーション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            同一ページ内のコンテンツを切り替え。URLは変わらない。
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">基本（テキスト）</h3>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="analytics">分析</TabsTrigger>
                  <TabsTrigger value="reports">レポート</TabsTrigger>
                  <TabsTrigger value="settings">設定</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <div className="bg-muted rounded-lg p-4">概要コンテンツ</div>
                </TabsContent>
                <TabsContent value="analytics" className="mt-4">
                  <div className="bg-muted rounded-lg p-4">分析コンテンツ</div>
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                  <div className="bg-muted rounded-lg p-4">レポートコンテンツ</div>
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                  <div className="bg-muted rounded-lg p-4">設定コンテンツ</div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">アイコン付き</h3>
              <Tabs defaultValue="calendar">
                <TabsList>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="size-4" />
                    カレンダー
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <Clock className="size-4" />
                    タイムライン
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="size-4" />
                    設定
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    コンテンツ1
  </TabsContent>
</Tabs>`}
          </pre>
        </section>

        {/* ブレッドクラム */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ブレッドクラム</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            階層構造を表示。上位ページへ戻れる。現在位置は最後に表示。
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">基本</h3>
              <nav className="text-muted-foreground flex items-center gap-2 text-sm">
                <a href="#" className="hover:text-foreground">
                  ホーム
                </a>
                <span>/</span>
                <a href="#" className="hover:text-foreground">
                  プロジェクト
                </a>
                <span>/</span>
                <span className="text-foreground font-medium">設定</span>
              </nav>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">アイコン付き</h3>
              <nav className="text-muted-foreground flex items-center gap-2 text-sm">
                <a href="#" className="hover:text-foreground flex items-center gap-1">
                  <Home className="size-4" />
                  ホーム
                </a>
                <ChevronRight className="size-4" />
                <a href="#" className="hover:text-foreground">
                  プロジェクト
                </a>
                <ChevronRight className="size-4" />
                <span className="text-foreground font-medium">詳細</span>
              </nav>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">省略形（長い階層）</h3>
              <nav className="text-muted-foreground flex items-center gap-2 text-sm">
                <a href="#" className="hover:text-foreground">
                  ホーム
                </a>
                <span>/</span>
                <span>...</span>
                <span>/</span>
                <a href="#" className="hover:text-foreground">
                  親フォルダ
                </a>
                <span>/</span>
                <span className="text-foreground font-medium">現在のページ</span>
              </nav>
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<nav className="flex items-center gap-2 text-sm">
  <a href="/">ホーム</a>
  <span>/</span>
  <a href="/projects">プロジェクト</a>
  <span>/</span>
  <span className="font-medium">現在のページ</span>
</nav>`}
          </pre>
        </section>

        {/* セグメンテッドコントロール */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">セグメンテッドコントロール</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            表示モードの切り替え。アイコンのみで使用することが多い。
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">表示切り替え</h3>
              <ViewToggle />
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">期間切り替え</h3>
              <PeriodToggle />
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`// Tabsを使用してセグメンテッドコントロールを実装
<Tabs defaultValue="grid">
  <TabsList className="h-9">
    <TabsTrigger value="grid" className="px-3">
      <LayoutGrid className="size-4" />
    </TabsTrigger>
    <TabsTrigger value="list" className="px-3">
      <List className="size-4" />
    </TabsTrigger>
  </TabsList>
</Tabs>`}
          </pre>
        </section>

        {/* ステッパー */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ステッパー</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            複数ステップのフロー。進捗を視覚的に表示。
          </p>

          <StepperDemo />

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`// ステップインジケーター
<div className="flex items-center gap-2">
  {/* 完了 */}
  <div className="bg-primary text-primary-foreground size-8 rounded-full">
    <Check className="size-4" />
  </div>

  {/* 現在 */}
  <div className="border-primary bg-primary/10 text-primary border-2 size-8 rounded-full">
    2
  </div>

  {/* 未完了 */}
  <div className="border-border text-muted-foreground border size-8 rounded-full">
    3
  </div>
</div>`}
          </pre>
        </section>

        {/* ページネーション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ページネーション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            大量データの分割表示。テーブルやリストと組み合わせる。
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">シンプル（前後のみ）</h3>
              <SimplePagination />
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">ページ番号付き</h3>
              <NumberedPagination />
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`// シンプルなページネーション
<div className="flex items-center justify-between">
  <span className="text-muted-foreground text-sm">
    25件中 1-10件を表示
  </span>
  <div className="flex gap-1">
    <Button variant="outline" size="icon" disabled={page === 1}>
      <ChevronLeft className="size-4" />
    </Button>
    <Button variant="outline" size="icon" disabled={page === maxPage}>
      <ChevronRight className="size-4" />
    </Button>
  </div>
</div>`}
          </pre>
        </section>

        {/* ベストプラクティス */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ベストプラクティス</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-success space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Do</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>現在位置を明確に表示</li>
                <li>タブは5個以下に制限</li>
                <li>ブレッドクラムは階層に合わせて</li>
                <li>ページ番号は省略して表示</li>
              </ul>
            </div>
            <div className="border-destructive space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Don&apos;t</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>タブをネストしない</li>
                <li>ブレッドクラムの最後をリンクにしない</li>
                <li>モバイルで横スクロールタブは避ける</li>
                <li>ステップが多すぎるフロー（6以上）</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};

function ViewToggle() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
      <TabsList className="h-9">
        <TabsTrigger value="grid" className="px-3">
          <LayoutGrid className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="list" className="px-3">
          <List className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function PeriodToggle() {
  const [period, setPeriod] = useState('week');

  return (
    <Tabs value={period} onValueChange={setPeriod}>
      <TabsList>
        <TabsTrigger value="day">日</TabsTrigger>
        <TabsTrigger value="week">週</TabsTrigger>
        <TabsTrigger value="month">月</TabsTrigger>
        <TabsTrigger value="year">年</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function StepperDemo() {
  const [step, setStep] = useState(2);
  const steps = ['アカウント', 'プロフィール', '通知設定', '完了'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  index < step
                    ? 'bg-primary text-primary-foreground'
                    : index === step
                      ? 'border-primary bg-primary/10 text-primary border-2'
                      : 'border-border text-muted-foreground border'
                }`}
              >
                {index < step ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs ${index === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${index < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          戻る
        </Button>
        <Button disabled={step === steps.length - 1} onClick={() => setStep((s) => s + 1)}>
          {step === steps.length - 2 ? '完了' : '次へ'}
        </Button>
      </div>
    </div>
  );
}

function SimplePagination() {
  const [page, setPage] = useState(1);
  const total = 25;
  const perPage = 10;
  const maxPage = Math.ceil(total / perPage);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">
        {total}件中 {start}-{end}件を表示
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-muted-foreground px-2 text-sm">
          {page} / {maxPage}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page === maxPage}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function NumberedPagination() {
  const [page, setPage] = useState(1);
  const maxPage = 10;

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (maxPage <= 7) {
      for (let i = 1; i <= maxPage; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', maxPage);
      } else if (page >= maxPage - 2) {
        pages.push(1, '...', maxPage - 3, maxPage - 2, maxPage - 1, maxPage);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', maxPage);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {getPages().map((p, i) =>
        typeof p === 'number' ? (
          <Button
            key={i}
            variant={page === p ? 'primary' : 'outline'}
            size="icon"
            className="size-8"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ) : (
          <span key={i} className="text-muted-foreground px-1">
            {p}
          </span>
        ),
      )}
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={page === maxPage}
        onClick={() => setPage((p) => p + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
