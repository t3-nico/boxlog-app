import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const meta = {
  title: 'Patterns/Tables',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const sampleData = [
  { id: '1', name: 'プロジェクトA', status: 'active', date: '2024-01-15', hours: 24 },
  { id: '2', name: 'プロジェクトB', status: 'completed', date: '2024-01-10', hours: 48 },
  { id: '3', name: 'プロジェクトC', status: 'active', date: '2024-01-20', hours: 12 },
  { id: '4', name: 'プロジェクトD', status: 'archived', date: '2024-01-05', hours: 36 },
  { id: '5', name: 'プロジェクトE', status: 'active', date: '2024-01-18', hours: 8 },
];

export const Overview: Story = {
  render: () => (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Table Patterns</h1>
      <p className="text-muted-foreground mb-8">
        データテーブルのパターン。ソート、選択、ページネーションの実装例。
      </p>

      <div className="grid max-w-5xl gap-8">
        {/* 使い分けガイド */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">テーブル構成要素</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-3 text-left font-bold">要素</th>
                  <th className="py-3 text-left font-bold">用途</th>
                  <th className="py-3 text-left font-bold">必須度</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">ヘッダー</td>
                  <td className="py-3">列の説明、ソートトリガー</td>
                  <td className="py-3">必須</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">行選択</td>
                  <td className="py-3">一括操作のための複数選択</td>
                  <td className="py-3">任意</td>
                </tr>
                <tr className="border-border border-b">
                  <td className="py-3 font-bold">行アクション</td>
                  <td className="py-3">編集、削除等の個別操作</td>
                  <td className="py-3">任意</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">ページネーション</td>
                  <td className="py-3">大量データの分割表示</td>
                  <td className="py-3">10件超で推奨</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 基本テーブル */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">基本テーブル</h2>
          <p className="text-muted-foreground mb-4 text-sm">シンプルなデータ表示。</p>

          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>日付</TableHead>
                  <TableHead className="text-right">時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.slice(0, 3).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right">{row.hours}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>名前</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>データ</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
          </pre>
        </section>

        {/* ソート可能テーブル */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ソート可能テーブル</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            ヘッダークリックでソート。現在のソート状態をアイコンで表示。
          </p>

          <SortableTable />

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`// ソートヘッダー
<TableHead>
  <button onClick={toggleSort} className="flex items-center gap-1">
    名前
    {sortDir === 'asc' && <ArrowUp className="size-4" />}
    {sortDir === 'desc' && <ArrowDown className="size-4" />}
    {!sortDir && <ArrowUpDown className="size-4 opacity-50" />}
  </button>
</TableHead>`}
          </pre>
        </section>

        {/* 選択可能テーブル */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">選択可能テーブル</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            チェックボックスで複数選択。一括操作に使用。
          </p>

          <SelectableTable />

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`// 選択行のスタイル
<TableRow data-state={selected ? 'selected' : undefined}>
  <TableCell>
    <Checkbox checked={selected} />
  </TableCell>
</TableRow>

// data-state="selected" で bg-surface-container が適用される`}
          </pre>
        </section>

        {/* 行アクション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">行アクション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            各行に対する操作メニュー。DropdownMenuを使用。
          </p>

          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.slice(0, 3).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" icon>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>編集</DropdownMenuItem>
                          <DropdownMenuItem>複製</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">削除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ページネーション */}
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-bold">ページネーション</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            大量データを分割表示。件数表示と前後ナビゲーション。
          </p>

          <Pagination />

          <pre className="bg-container mt-4 overflow-x-auto rounded-lg p-4 text-xs">
            {`<div className="flex items-center justify-between">
  <span className="text-muted-foreground text-sm">
    {total}件中 {start}-{end}件を表示
  </span>
  <div className="flex gap-1">
    <Button variant="outline" icon disabled={page === 1}>
      <ChevronLeft className="size-4" />
    </Button>
    <Button variant="outline" icon disabled={page === maxPage}>
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
                <li>数値は右揃え、テキストは左揃え</li>
                <li>ソート状態をアイコンで明示</li>
                <li>選択行を視覚的に区別</li>
                <li>空状態のメッセージを表示</li>
              </ul>
            </div>
            <div className="border-destructive space-y-2 border-l-4 pl-4">
              <h3 className="font-bold">Don&apos;t</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>全列をソート可能にしない</li>
                <li>列幅が狭すぎてテキストが折り返す</li>
                <li>100件以上をページネーションなしで表示</li>
                <li>モバイルで横スクロールなしの多列表示</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'primary' | 'secondary' | 'outline'> = {
    active: 'primary',
    completed: 'secondary',
    archived: 'outline',
  };
  const labels: Record<string, string> = {
    active: '進行中',
    completed: '完了',
    archived: 'アーカイブ',
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

function SortableTable() {
  const [sortKey, setSortKey] = useState<string | null>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...sampleData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey as keyof typeof a];
    const bVal = b[sortKey as keyof typeof b];
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="size-4 opacity-50" />;
    return sortDir === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  };

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                className="flex items-center gap-1 hover:underline"
                onClick={() => toggleSort('name')}
              >
                名前
                <SortIcon columnKey="name" />
              </button>
            </TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>
              <button
                type="button"
                className="flex items-center gap-1 hover:underline"
                onClick={() => toggleSort('date')}
              >
                日付
                <SortIcon columnKey="date" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                className="ml-auto flex items-center gap-1 hover:underline"
                onClick={() => toggleSort('hours')}
              >
                時間
                <SortIcon columnKey="hours" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell className="text-right">{row.hours}h</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SelectableTable() {
  const [selected, setSelected] = useState<string[]>(['1']);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectAll = () => setSelected(sampleData.map((d) => d.id));
  const deselectAll = () => setSelected([]);

  const allSelected = selected.length === sampleData.length;
  const someSelected = selected.length > 0 && selected.length < sampleData.length;

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-2">
          <span className="text-sm">{selected.length}件を選択中</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              一括編集
            </Button>
            <Button variant="destructive" size="sm">
              一括削除
            </Button>
          </div>
        </div>
      )}
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.dataset.indeterminate = someSelected ? 'true' : 'false';
                  }}
                  onCheckedChange={(checked) => (checked ? selectAll() : deselectAll())}
                />
              </TableHead>
              <TableHead>名前</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow
                key={row.id}
                data-state={selected.includes(row.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(row.id)}
                    onCheckedChange={() => toggle(row.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right">{row.hours}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Pagination() {
  const [page, setPage] = useState(1);
  const perPage = 3;
  const total = 25;
  const maxPage = Math.ceil(total / perPage);

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.slice(0, perPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {total}件中 {start}-{end}件を表示
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            icon
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
            icon
            className="size-8"
            disabled={page === maxPage}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
