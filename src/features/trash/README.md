# trash - 統一ゴミ箱機能

BoxLogアプリケーションの統一ゴミ箱システム。すべての削除可能なアイテムを一元管理します。

## 📋 概要

8種類のアイテムタイプ（イベント、タスク、ドキュメント等）を統一的に管理し、復元・完全削除をサポートします。30日間の保存期間後、自動クリーンアップが実行されます。

## 🏗️ ディレクトリ構成

```
src/features/trash/
├── components/              # UIコンポーネント
│   ├── TrashView.tsx              # メインビュー
│   ├── TrashTable.tsx             # テーブル表示
│   ├── TrashActions.tsx           # アクションボタン群
│   ├── TrashActionButtons.tsx     # 個別アクションボタン
│   ├── TrashConfirmDialog.tsx     # 確認ダイアログ
│   └── TrashStatsDisplay.tsx      # 統計情報表示
├── hooks/                   # カスタムフック
│   └── useTrashActions.ts         # アクション処理フック
├── stores/                  # 状態管理
│   ├── trashStore.ts              # ストア定義（非推奨）
│   └── useTrashStore.ts           # Zustandストア（推奨）
├── types/                   # 型定義
│   └── trash.ts                   # 型定義・定数
├── utils/                   # ユーティリティ
│   └── trash-operations.ts        # 操作ヘルパー関数
├── index.ts                 # エクスポート定義
└── README.md                # このファイル
```

## 🗑️ サポートするアイテムタイプ

### 8種類のアイテムタイプ
[types/trash.ts](./types/trash.ts:7-15) で定義：

| タイプ | アイコン | 用途 | 実装状況 |
|--------|----------|------|----------|
| `event` | 📅 | カレンダーイベント | ✅ 復元実装済み |
| `task` | ✅ | タスク | ✅ 復元実装済み |
| `document` | 📄 | ドキュメント | 🚧 復元未実装 |
| `note` | 📝 | メモ・ノート | 🚧 復元未実装 |
| `tag` | 🏷️ | タグ | 🚧 復元未実装 |
| `folder` | 📁 | フォルダ・カテゴリ | 🚧 復元未実装 |
| `record` | 📊 | 記録・レコード | 🚧 復元未実装 |
| `template` | 📋 | テンプレート | 🚧 復元未実装 |

## 🎯 主要機能

### 1. ゴミ箱への追加

#### 単一アイテムの追加
```typescript
import { addToTrash } from '@/features/trash'

await addToTrash({
  id: 'event-123',
  type: 'event',
  title: 'ミーティング',
  description: '2025年10月1日のミーティング',
  deletedFrom: '/calendar',
  originalData: { ...eventData }, // 復元用の完全なデータ
  metadata: {
    color: '#3B82F6',
    icon: '📅',
    tags: ['仕事', '重要'],
    priority: 'high'
  }
})
```

#### 複数アイテムの一括追加
```typescript
import { addMultipleToTrash } from '@/features/trash'

await addMultipleToTrash([
  { id: 'task-1', type: 'task', title: 'タスク1', originalData: {...} },
  { id: 'task-2', type: 'task', title: 'タスク2', originalData: {...} },
])
```

### 2. アイテムの復元

#### 単一復元
```typescript
import { useTrashStore } from '@/features/trash'

const { restoreItem } = useTrashStore()
await restoreItem('event-123')
```

#### 複数復元
```typescript
const { restoreItems, selectedIds } = useTrashStore()
await restoreItems(Array.from(selectedIds))
```

**復元処理の流れ:**
1. `originalData` から元のデータを取得
2. タイプ別ストア（`useEventStore`, `useTaskStore` 等）で復元処理
3. ゴミ箱からアイテムを削除
4. 成功・失敗を集計して結果を返す

[useTrashStore.ts](./stores/useTrashStore.ts:459-490) で実装。

### 3. 完全削除

#### 単一削除（確認ダイアログ付き）
```typescript
const { permanentlyDelete } = useTrashStore()
await permanentlyDelete('event-123')
// → "「ミーティング」を完全に削除しますか？この操作は元に戻せません。"
```

#### 複数削除
```typescript
const { permanentlyDeleteItems, selectedIds } = useTrashStore()
await permanentlyDeleteItems(Array.from(selectedIds))
```

#### ゴミ箱を空にする
```typescript
const { emptyTrash } = useTrashStore()
await emptyTrash()
// → すべてのアイテムを削除（確認ダイアログ付き）
```

### 4. 自動クリーンアップ

#### 保存期間と警告
```typescript
export const TRASH_RETENTION_DAYS = 30  // 30日後に自動削除
export const TRASH_WARNING_DAYS = 7     // 残り7日で警告表示
```

#### 期限切れアイテムの削除
```typescript
const { clearExpiredItems } = useTrashStore()
await clearExpiredItems()
```

**自動実行:**
- アプリ起動時に期限切れアイテムを自動チェック
- 1日1回のクリーンアップ（[useTrashStore.ts](./stores/useTrashStore.ts:493-505)）

### 5. フィルター・検索

#### 検索
```typescript
const { setFilters } = useTrashStore()
setFilters({ searchQuery: 'ミーティング' })
```

検索対象:
- `title`: アイテムタイトル
- `description`: 説明文
- `metadata.tags`: タグ

#### フィルター適用済みアイテム取得
```typescript
const { getFilteredItems } = useTrashStore()
const items = getFilteredItems()
// → 検索クエリ適用 + 削除日時降順ソート
```

### 6. 統計情報

```typescript
const { getStats } = useTrashStore()
const stats = getStats()

// {
//   totalItems: 42,                      // 総アイテム数
//   itemsByType: {                       // タイプ別カウント
//     event: 10,
//     task: 20,
//     ...
//   },
//   expiredItems: 3,                     // 期限切れ数
//   deletedToday: 5,                     // 今日削除された数
//   deletedThisWeek: 15,                 // 今週削除された数
//   deletedThisMonth: 30,                // 今月削除された数
//   estimatedSize: 1024000               // 推定サイズ（バイト）
// }
```

## 🔧 データ構造

### TrashItem インターフェース
[types/trash.ts](./types/trash.ts:20-68) で定義：

```typescript
interface TrashItem {
  id: string                           // ユニークID
  type: TrashItemType                  // アイテムタイプ
  title: string                        // 表示用タイトル
  description?: string                 // 説明文
  deletedAt: Date                      // 削除日時
  deletedFrom?: string                 // 削除元パス
  originalData: Record<string, unknown> // 復元用データ
  metadata?: {                         // 表示用メタデータ
    color?: string
    icon?: string
    tags?: string[]
    parentId?: string
    imageUrl?: string
    subtitle?: string
    priority?: 'low' | 'medium' | 'high'
    fileSize?: number
  }
}
```

### ストレージ

**LocalStorage ベース:**
- キー: `'boxlog-trash'`
- 自動保存: アイテム追加・削除時に自動でLocalStorageに保存
- 自動読込: ストア初期化時にLocalStorageから読み込み

## 🎨 UIコンポーネント

### TrashView
メインビューコンポーネント（ゴミ箱画面全体）

```tsx
import { TrashView } from '@/features/trash'

export default function TrashPage() {
  return <TrashView />
}
```

### TrashTable
テーブル形式でアイテムを表示

**機能:**
- 複数選択（チェックボックス）
- ソート機能
- タイプ別アイコン表示
- 削除日時表示
- メタデータ表示

### TrashActions
アクションボタン群

**ボタン:**
- 復元
- 完全削除
- すべて選択
- 選択解除
- ゴミ箱を空にする
- 期限切れアイテム削除

### TrashConfirmDialog
確認ダイアログ（危険な操作時に表示）

**表示タイミング:**
- 完全削除時
- ゴミ箱を空にする時
- 期限切れアイテム削除時

### TrashStatsDisplay
統計情報の表示

**表示内容:**
- 総アイテム数
- タイプ別カウント
- 期限切れ警告
- 推定サイズ

## 🪝 カスタムフック

### useTrashActions
[useTrashActions.ts](./hooks/useTrashActions.ts) で実装：

```tsx
import { useTrashActions } from '@/features/trash/hooks/useTrashActions'

function Component() {
  const {
    // State
    showConfirmDialog,    // 確認ダイアログの状態
    loading,              // ローディング状態
    selectedCount,        // 選択数
    stats,                // 統計情報
    expiredItems,         // 期限切れアイテム
    filteredItems,        // フィルター適用済みアイテム

    // Actions
    handleRestore,        // 復元処理
    handlePermanentDelete, // 完全削除処理
    handleEmptyTrash,     // ゴミ箱を空にする
    handleClearExpired,   // 期限切れアイテム削除
    handleCloseDialog,    // ダイアログを閉じる
    deselectAll,          // すべて選択解除
  } = useTrashActions()

  // ...
}
```

**特徴:**
- 確認ダイアログの状態管理
- エラーハンドリング
- ローディング状態の自動管理

## 📦 エクスポート

### 型定義
```typescript
export type {
  TrashItem,
  TrashItemType,
  TrashFiltersType,
  TrashSort,
  TrashState,
  TrashActionsType,
  TrashStore,
  TrashStats,
  RestoreResult,
  DeleteResult
}
```

### 定数・ヘルパー
```typescript
export {
  TRASH_ITEM_CONFIG,      // タイプ別設定（アイコン・色・ラベル）
  TRASH_RETENTION_DAYS,   // 保存期間（30日）
  TRASH_WARNING_DAYS,     // 警告期間（7日）
  isTrashItem,            // タイプガード関数
  isValidTrashItemType    // タイプ判定関数
}
```

### ストア・ユーティリティ
```typescript
export { useTrashStore }           // Zustandストア
export { trashOperations, validateTrashItem } // ユーティリティ
```

### コンポーネント
```typescript
export { TrashView }
export { TrashTable }
export { TrashActions }
```

### ヘルパー関数
```typescript
export { addToTrash }              // 単一追加ヘルパー
export { addMultipleToTrash }      // 複数追加ヘルパー
```

## 🔄 他機能との連携

### イベント削除時
```typescript
// src/features/events/stores/useEventStore.ts
import { addToTrash } from '@/features/trash'

const deleteEvent = async (eventId: string) => {
  const event = events.find(e => e.id === eventId)

  // ゴミ箱に追加
  await addToTrash({
    id: event.id,
    type: 'event',
    title: event.title,
    description: event.description,
    deletedFrom: '/calendar',
    originalData: event,
    metadata: {
      color: event.color,
      tags: event.tags,
    }
  })

  // イベントストアから削除
  removeEventFromStore(eventId)
}
```

### タスク削除時
```typescript
// src/features/tasks/stores/useTaskStore.ts
import { addToTrash } from '@/features/trash'

const deleteTask = async (taskId: string) => {
  const task = tasks.find(t => t.id === taskId)

  await addToTrash({
    id: task.id,
    type: 'task',
    title: task.title,
    originalData: task,
    metadata: {
      priority: task.priority,
    }
  })

  removeTaskFromStore(taskId)
}
```

## 🚨 エラーハンドリング

### 復元エラー
```typescript
try {
  await restoreItem('event-123')
} catch (error) {
  // エラーメッセージはストアの `error` プロパティに保存される
  console.error(error)
}

// エラー表示
const { error, clearError } = useTrashStore()
useEffect(() => {
  if (error) {
    toast.error(error)
    clearError()
  }
}, [error, clearError])
```

### 復元結果の集計
```typescript
const result = await restoreItems(['id1', 'id2', 'id3'])
// {
//   success: 2,
//   failed: 1,
//   errors: ['タスク2: Not found'],
//   restoredIds: ['id1', 'id3']
// }

if (result.failed > 0) {
  toast.warning(`${result.failed}件の復元に失敗しました`)
}
```

## 🧪 テスト

### ストアのテスト
```bash
npm run test -- src/features/trash/stores
```

### コンポーネントのテスト
```bash
npm run test -- src/features/trash/components
```

## 🚧 既知の制限事項

### 復元未実装のタイプ
以下のタイプは復元機能が未実装（[useTrashStore.ts](./stores/useTrashStore.ts:478-485)）:
- `document`
- `note`
- `tag`
- `folder`
- `record`
- `template`

**回避策:** 各featureで復元処理を実装後、`restoreItemByType` 関数に追加

### 型エラー
- [trash.ts](./types/trash.ts:1) に5件の型エラー（Issue #389で対応予定）
- [useTrashStore.ts](./stores/useTrashStore.ts:1-2) に型エラー（@ts-nocheck使用）

### LocalStorage の制限
- ブラウザのLocalStorage容量制限（通常5-10MB）
- 大量のアイテムや大きなファイルには不向き
- 将来的にはIndexedDBやサーバーストレージへの移行を検討

## 🔮 今後の改善

### 1. 復元機能の拡充
- [ ] `document` タイプの復元実装
- [ ] `note` タイプの復元実装
- [ ] `tag` タイプの復元実装
- [ ] `folder` タイプの復元実装
- [ ] `record` タイプの復元実装
- [ ] `template` タイプの復元実装

### 2. ストレージ改善
- [ ] IndexedDB への移行（大容量対応）
- [ ] サーバーサイドストレージ連携
- [ ] 圧縮機能（`originalData` の圧縮）

### 3. UI/UX改善
- [ ] プレビュー機能（復元前にデータ確認）
- [ ] 一括操作のプログレスバー
- [ ] タイプ別フィルター
- [ ] 日付範囲フィルター

### 4. セキュリティ
- [ ] 削除履歴の暗号化
- [ ] 復元権限の管理
- [ ] 監査ログ（誰がいつ復元/削除したか）

### 5. パフォーマンス
- [ ] 仮想スクロール（大量アイテム対応）
- [ ] ページネーション
- [ ] 遅延ロード（`originalData` の遅延読み込み）

## 📚 関連ドキュメント

### プロジェクト内
- [イベント機能](/src/features/events/README.md)
- [タスク機能](/src/features/tasks/)
- [エラーパターンガイド](/docs/ERROR_PATTERNS_GUIDE.md)

### 外部
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 📞 サポート

問題や質問がある場合：
- Issue作成: GitHub Issues
- ラベル: `feature:trash`, `P0-urgent`
- 関連Issue: [#389](https://github.com/t3-nico/boxlog-app/issues/389)（型エラー）, [#400](https://github.com/t3-nico/boxlog-app/issues/400)（このドキュメント作成）

---

**最終更新**: 2025-10-02
**メンテナー**: BoxLog Development Team
**優先度**: 🔴 緊急（データ保護関連）