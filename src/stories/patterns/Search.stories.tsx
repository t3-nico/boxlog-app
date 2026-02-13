import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, Clock, FileText, Search, Settings, Tag, User, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const meta = {
  title: 'Patterns/Search',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Search Patterns</h1>
      <p className="text-muted-foreground mb-8">
        検索UIのパターン。基本検索、オートコンプリート、コマンドパレットの使い分け。
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
                  <td className="py-3 font-bold">基本検索</td>
                  <td className="py-3">シンプルなテキスト検索</td>
                  <td className="py-3">常時表示</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">オートコンプリート</td>
                  <td className="py-3">入力補完、候補表示</td>
                  <td className="py-3">入力時</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">コマンドパレット</td>
                  <td className="py-3">アプリ全体の検索・操作</td>
                  <td className="py-3">⌘K</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">フィルター検索</td>
                  <td className="py-3">条件を絞り込んで検索</td>
                  <td className="py-3">常時表示</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 基本検索 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">基本検索</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            シンプルな検索入力。アイコン付きで視認性を確保。
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">アイコン付き</h3>
              <div className="relative max-w-md">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="検索..." className="pl-9" />
              </div>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">クリアボタン付き</h3>
              <SearchWithClear />
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">ショートカット表示</h3>
              <div className="relative max-w-md">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input placeholder="検索..." className="pr-16 pl-9" />
                <kbd className="bg-muted text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded px-2 py-0.5 text-xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
  <Input placeholder="検索..." className="pl-9" />
</div>`}
          </pre>
        </section>

        {/* オートコンプリート */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">オートコンプリート</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            入力に応じて候補を表示。Commandコンポーネントを使用。
          </p>

          <div className="max-w-md">
            <AutocompleteSearch />
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<Popover open={open}>
  <PopoverTrigger asChild>
    <Input value={query} onChange={...} />
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandList>
        <CommandGroup heading="候補">
          <CommandItem>結果1</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>`}
          </pre>
        </section>

        {/* コマンドパレット */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">コマンドパレット</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            アプリ全体の検索・操作。⌘K で起動。カテゴリ分けで整理。
          </p>

          <div className="border-border max-w-lg overflow-hidden rounded-lg border">
            <Command className="border-0">
              <CommandInput placeholder="検索またはコマンドを入力..." />
              <CommandList>
                <CommandEmpty>結果が見つかりません</CommandEmpty>
                <CommandGroup heading="最近のアイテム">
                  <CommandItem>
                    <Clock className="mr-2 size-4" />
                    プロジェクトA
                  </CommandItem>
                  <CommandItem>
                    <Clock className="mr-2 size-4" />
                    週次レポート
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="アクション">
                  <CommandItem>
                    <FileText className="mr-2 size-4" />
                    新規プロジェクト
                  </CommandItem>
                  <CommandItem>
                    <Tag className="mr-2 size-4" />
                    タグを追加
                  </CommandItem>
                  <CommandItem>
                    <Calendar className="mr-2 size-4" />
                    予定を作成
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="設定">
                  <CommandItem>
                    <User className="mr-2 size-4" />
                    プロフィール
                  </CommandItem>
                  <CommandItem>
                    <Settings className="mr-2 size-4" />
                    設定
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          <div className="bg-container mt-4 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-bold">構成ルール</h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>最近のアイテムを最上部に</li>
              <li>アクションはアイコン付きで</li>
              <li>カテゴリはセパレーターで区切る</li>
              <li>空結果時はメッセージを表示</li>
            </ul>
          </div>
        </section>

        {/* フィルター検索 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">フィルター検索</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            条件を絞り込んで検索。チップでフィルターを表示。
          </p>

          <FilterSearch />

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="flex flex-wrap gap-2">
  {filters.map((filter) => (
    <Badge key={filter} variant="secondary">
      {filter}
      <button onClick={() => removeFilter(filter)}>
        <X className="size-3" />
      </button>
    </Badge>
  ))}
</div>`}
          </pre>
        </section>

        {/* 検索結果 */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">検索結果</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            検索結果の表示パターン。ハイライト、件数、空状態。
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">
                結果あり（ハイライト）
              </h3>
              <div className="border-border divide-border divide-y rounded-lg border">
                <div className="p-3">
                  <p className="font-medium">
                    <span className="bg-yellow-200 dark:bg-yellow-800">プロジェクト</span>A -
                    週次レビュー
                  </p>
                  <p className="text-muted-foreground text-sm">
                    今週の<span className="bg-yellow-200 dark:bg-yellow-800">プロジェクト</span>
                    進捗を確認
                  </p>
                </div>
                <div className="p-3">
                  <p className="font-medium">
                    <span className="bg-yellow-200 dark:bg-yellow-800">プロジェクト</span>B -
                    キックオフ
                  </p>
                  <p className="text-muted-foreground text-sm">
                    新規<span className="bg-yellow-200 dark:bg-yellow-800">プロジェクト</span>
                    の立ち上げ
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">2件の結果</p>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-bold">結果なし</h3>
              <div className="border-border rounded-lg border p-8 text-center">
                <Search className="text-muted-foreground mx-auto size-8" />
                <p className="mt-2 font-medium">結果が見つかりません</p>
                <p className="text-muted-foreground text-sm">別のキーワードで検索してください</p>
              </div>
            </div>
          </div>
        </section>

        {/* ベストプラクティス */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ベストプラクティス</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-success space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Do</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>検索アイコンを左に配置</li>
                <li>デバウンスで過剰なリクエスト防止</li>
                <li>最近の検索を表示</li>
                <li>検索結果をハイライト</li>
              </ul>
            </div>
            <div className="border-destructive space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Don&apos;t</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>Enterを押すまで検索しない</li>
                <li>結果0件でエラー表示</li>
                <li>候補が多すぎる（10件以下推奨）</li>
                <li>検索中のフィードバックなし</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};

function SearchWithClear() {
  const [query, setQuery] = useState('検索テキスト');

  return (
    <div className="relative max-w-md">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="検索..."
        className="pr-9 pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          onClick={() => setQuery('')}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function AutocompleteSearch() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const suggestions = [
    'プロジェクトA',
    'プロジェクトB',
    'プロジェクトC',
    'タスク管理',
    'タイムトラッキング',
  ];
  const filtered = suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popover open={open && query.length > 0}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="検索..."
            className="pl-9"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>結果が見つかりません</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((item) => (
                  <CommandItem
                    key={item}
                    onSelect={() => {
                      setQuery(item);
                      setOpen(false);
                    }}
                  >
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FilterSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(['進行中', '今週']);
  const availableFilters = ['進行中', '完了', '今週', '今月', '優先度高', '優先度低'];

  const removeFilter = (filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
  };

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters((prev) => [...prev, filter]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="検索..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">フィルター</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`hover:bg-state-hover w-full rounded px-3 py-2 text-left text-sm ${
                    filters.includes(filter) ? 'bg-state-active' : ''
                  }`}
                  onClick={() =>
                    filters.includes(filter) ? removeFilter(filter) : addFilter(filter)
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1 pr-1">
              {filter}
              <button
                type="button"
                onClick={() => removeFilter(filter)}
                className="hover:bg-muted ml-1 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm"
            onClick={() => setFilters([])}
          >
            すべてクリア
          </button>
        </div>
      )}
    </div>
  );
}
