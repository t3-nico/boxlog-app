# Search機能 - 実装ドキュメント

## 📋 概要

グローバル検索機能の実装。shadcn/ui CommandDialogを使用し、Tasks・Events・Tags・Smart Foldersを横断検索します。

## 🏗️ アーキテクチャ

### 構成

```
src/features/search/
├── components/
│   ├── global-search-modal.tsx  # メインの検索モーダル（⌘K）
│   └── search-bar.tsx            # インライン検索バー（Combobox）
├── hooks/
│   ├── use-global-search.tsx     # グローバル検索状態管理
│   └── use-search.ts             # 検索履歴管理
├── types/
│   └── index.ts                  # 型定義
└── index.ts                      # エクスポート
```

### 使用技術スタック

| 技術                  | 用途                    | 理由                               |
| --------------------- | ----------------------- | ---------------------------------- |
| **shadcn/ui Command** | 検索UI                  | 公式推奨、cmdk組み込みファジー検索 |
| **shadcn/ui Dialog**  | モーダル表示            | CommandDialogのベース              |
| **shadcn/ui Popover** | SearchBarドロップダウン | Comboboxパターン                   |
| **React Context**     | グローバル状態          | モーダル開閉制御                   |
| **localStorage**      | 検索履歴                | クライアント永続化                 |
| **Next.js useRouter** | ナビゲーション          | App Router対応                     |

## 🎯 主要機能

### 1. GlobalSearchModal（⌘K検索）

**ファイル**: `components/global-search-modal.tsx`

#### 機能

- ⌘K / Ctrl+Kでモーダル起動
- Tasks・Events・Tags・Smart Foldersを横断検索
- 検索履歴表示（最新5件）
- サジェスト機能（High priority tasks、Today's events等）
- クリック時の自動ナビゲーション

#### キーボードショートカット

```tsx
// グローバルに登録（use-global-search.tsx）
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setIsOpen((open) => !open)
    }
  }
  document.addEventListener('keydown', down)
  return () => document.removeEventListener('keydown', down)
}, [])
```

#### データソース

```tsx
// Zustandストアから直接取得（リアルタイム）
const tasks = useTaskStore((state) => state.tasks)
const tags = useTagStore((state) => state.tags)
const smartFolders = useSmartFolderStore((state) => state.smartFolders)
const events = useEventStore((state) => state.events)
```

#### ナビゲーション

| アイテム種別   | 遷移先                        |
| -------------- | ----------------------------- |
| Task           | `/tasks/${task.id}`           |
| Event          | `/calendar?event=${event.id}` |
| Tag            | `/tags/${tag.id}`             |
| Smart Folder   | `/smart-folders/${folder.id}` |
| High priority  | `/tasks?priority=high`        |
| Today's events | `/calendar?view=today`        |
| Untagged items | `/tasks?filter=untagged`      |

#### スタイリング（重要）

```tsx
// モーダル幅: Tailwindクラスが効かないため、インラインstyleを使用
<DialogContent className="overflow-hidden p-0" style={{ maxWidth: '768px' }}>

// 高さ制限
<CommandList className="max-h-[500px]">
```

**注意**: `cn()`（tailwind-merge）の制約により、`sm:max-w-2xl`等のクラスが無視される。`style`属性で直接指定すること。

### 2. SearchBar（インライン検索）

**ファイル**: `components/search-bar.tsx`

#### 機能

- Popover + CommandによるComboboxパターン
- `keywords`プロパティで検索対象を拡張
- ドロップダウン表示

#### 使用例

```tsx
<SearchBar
  items={tasks}
  onSelect={(task) => console.log(task)}
  placeholder="Search tasks..."
  renderItem={(task) => task.title}
  getItemValue={(task) => task.title}
  keywords={(task) => [task.description || '', ...(task.tags || [])]}
/>
```

### 3. 検索履歴管理

**ファイル**: `hooks/use-search.ts`

```tsx
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('search-history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const addToHistory = (query: string) => {
    const updated = [query, ...history.filter((q) => q !== query)].slice(0, 10)
    setHistory(updated)
    localStorage.setItem('search-history', JSON.stringify(updated))
  }

  return { history, addToHistory }
}
```

- 最大10件保存
- 重複排除
- localStorage永続化

## 🚫 削除した実装（Issue #513）

### 1. カスタム検索エンジン（738行）

- **ファイル**: `src/features/search/lib/search-engine.ts`
- **理由**: cmdkの組み込みファジー検索で十分
- **削除内容**: Fuse.jsベースの複雑な検索ロジック

### 2. 旧CommandPalette（1000+行）

- **ディレクトリ**: `src/features/command-palette/`
- **理由**: GlobalSearchModalと重複（⌘Kが2つ登録されていた）
- **削除内容**: カスタムコマンドパレット実装全体

## 📝 cmdk組み込み検索の仕様

### 検索対象の指定

```tsx
<CommandItem
  value={task.title}                    // メイン検索文字列
  keywords={[                            // 追加検索文字列
    task.description || '',
    ...(task.tags || [])
  ]}
>
```

### 検索アルゴリズム

- **ファジーマッチング**: 順序を考慮した部分一致
- **スコアリング**: 完全一致 > 前方一致 > 部分一致
- **大文字小文字**: 区別しない

### フィルタリングの無効化

```tsx
// カスタムフィルタが必要な場合
<Command shouldFilter={false}>{/* 独自のフィルタロジック */}</Command>
```

## 🔄 統合ポイント

### 1. Sidebar統合

**ファイル**: `src/features/navigation/components/sidebar/nav-secondary.tsx`

```tsx
const { open: openGlobalSearch } = useGlobalSearch()

if (item.title === 'Search') {
  e.preventDefault()
  openGlobalSearch()
}
```

### 2. Provider登録

**ファイル**: `src/components/common/Providers/Providers.tsx`

```tsx
import { GlobalSearchProvider } from '@/features/search'

;<GlobalSearchProvider>{children}</GlobalSearchProvider>
```

### 3. グローバルモーダル配置

**ファイル**: `src/app/(app)/layout.tsx`

```tsx
import { GlobalSearchModal, useGlobalSearch } from '@/features/search'

const { isOpen, close } = useGlobalSearch()
<GlobalSearchModal isOpen={isOpen} onClose={close} />
```

## 🎨 デザイン仕様

### モーダルサイズ

- **最大幅**: 768px（`max-w-2xl`相当）
- **最大高さ**: 500px
- **レスポンシブ**: モバイルでは`calc(100% - 2rem)`

### カラー

```tsx
// globals.cssのセマンティックトークンを使用
className = 'bg-muted text-muted-foreground' // ヘッダー
className = 'text-foreground' // アイテム
```

### アイコン

| アイテム      | アイコン    |
| ------------- | ----------- |
| Task          | CheckSquare |
| Event         | Calendar    |
| Tag           | Tag         |
| Smart Folder  | Folder      |
| Recent Search | Clock       |
| High Priority | TrendingUp  |

## 🚀 将来の拡張候補

### オプション機能（必要になったら実装）

1. **Fuse.js導入**
   - 大規模データ（1000件以上）での検索精度向上
   - 日本語の曖昧検索強化
   - スコアリングのカスタマイズ

2. **TanStack Query v5**
   - サーバー側検索API実装
   - 無限スクロール（検索結果が多い場合）
   - バックグラウンド更新

3. **検索フィルタUI**
   - 種別絞り込み（Tasks only等）
   - 日付範囲指定
   - 優先度・ステータスフィルタ

4. **アクションコマンド**
   - 「新規タスク作成」等のクイックアクション
   - 設定画面へのジャンプ

## 🐛 既知の制限事項

### 1. Tailwindクラスの優先順位問題

**問題**: DialogContentの`max-w-*`クラスが効かない
**原因**: `cn()`（tailwind-merge）の内部処理で上書きされる
**解決**: `style={{ maxWidth: '768px' }}`で直接指定

### 2. 検索結果の件数制限

**現状**: 各カテゴリ5件まで（`.slice(0, 5)`）
**理由**: パフォーマンスとUI見やすさのバランス
**拡張**: 無限スクロールが必要になったらTanStack Query導入

## 📚 参考リソース

- **cmdk公式**: https://cmdk.paco.me/
- **shadcn/ui Command**: https://ui.shadcn.com/docs/components/command
- **shadcn/ui Dialog**: https://ui.shadcn.com/docs/components/dialog
- **Next.js useRouter**: https://nextjs.org/docs/app/api-reference/functions/use-router

---

**最終更新**: 2025-10-09
**関連Issue**: #513 - 検索機能リファクタリング
**実装者**: Claude Code
