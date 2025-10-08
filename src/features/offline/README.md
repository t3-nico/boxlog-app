# Offline Feature

BoxLogアプリケーションのオフライン対応・データ同期機能。

## 📋 概要

ネットワーク切断時もアプリ操作を継続できるようにし、オンライン復帰時に自動的にサーバーと同期します。IndexedDBを使用してローカルデータを永続化し、競合が発生した場合は適切に解決します。

## 🎯 主要機能

### 1. オフライン操作の記録

- ネットワーク切断時も操作を継続可能
- IndexedDBに操作履歴を自動保存
- オンライン復帰時に自動同期

### 2. 同期キュー管理

- タイムスタンプ順に操作を処理
- 最大3回の自動リトライ
- バックグラウンドで定期的に同期チェック（30秒ごと）

### 3. 競合解決

- サーバーとローカルデータの競合を自動検出
- 3つの解決戦略:
  - `local` - ローカルデータを優先
  - `server` - サーバーデータを優先
  - `merge` - 手動でマージしたデータを使用

### 4. イベント駆動設計

- リアルタイムで状態変化を監視
- カスタムイベントハンドラ登録可能

## 🚀 使用方法

### 基本的な使用例

```typescript
import { offlineManager } from '@/features/offline'

// アクションの記録
const actionId = await offlineManager.recordAction({
  type: 'create',
  entity: 'tasks',
  data: {
    title: 'New Task',
    status: 'todo',
  },
})

// 保留中のアクション取得
const pendingActions = await offlineManager.getPendingActions()
console.log(`${pendingActions.length}件の同期待ちアクション`)

// ステータス確認
const status = offlineManager.getStatus()
console.log('オンライン:', status.isOnline)
console.log('同期中:', status.syncInProgress)
```

### イベントリスナーの登録

```typescript
// オンライン復帰時
offlineManager.on('online', () => {
  console.log('ネットワーク接続が復帰しました')
})

// 同期完了時
offlineManager.on('syncCompleted', (event) => {
  console.log(`${event.processed}件のアクションを同期しました`)
  if (event.conflicts > 0) {
    console.warn(`${event.conflicts}件の競合が検出されました`)
  }
})

// 競合検出時
offlineManager.on('conflictDetected', (event) => {
  console.warn('競合を検出:', event.conflictId)
  // ユーザーに競合解決UIを表示
  showConflictResolutionDialog(event)
})
```

### 競合解決

```typescript
// ローカルデータを優先
await offlineManager.resolveConflict(conflictId, {
  choice: 'local',
})

// サーバーデータを優先
await offlineManager.resolveConflict(conflictId, {
  choice: 'server',
})

// マージしたデータを使用
await offlineManager.resolveConflict(conflictId, {
  choice: 'merge',
  mergedData: {
    // マージ済みのデータ
    title: localData.title,
    status: serverData.status,
    updatedAt: new Date(),
  },
})
```

### React統合

```typescript
import { useOfflineSync } from '@/hooks/useOfflineSync'

function MyComponent() {
  const { isOnline, syncInProgress, pendingCount } = useOfflineSync()

  return (
    <div>
      {!isOnline && <OfflineBanner />}
      {syncInProgress && <SyncingIndicator />}
      {pendingCount > 0 && (
        <div>{pendingCount}件の同期待ちアクション</div>
      )}
    </div>
  )
}
```

## 📊 データ構造

### OfflineAction

```typescript
interface OfflineAction<T = unknown> {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: T
  timestamp: Date
  syncStatus: 'pending' | 'syncing' | 'completed' | 'conflict'
  retryCount?: number
}
```

### SyncResult

```typescript
interface SyncResult<T = unknown> {
  success: boolean
  conflicts?: ConflictData<T>[]
  serverData?: T
  error?: string
}
```

## 🗄️ IndexedDB構造

### actions ストア

- **keyPath**: `id`
- **インデックス**: `timestamp`, `syncStatus`, `entity`
- **用途**: オフライン操作履歴の保存

### cache ストア

- **keyPath**: `key`
- **インデックス**: `expiry`
- **用途**: ローカルキャッシュ（24時間保持）

### conflicts ストア

- **keyPath**: `id`
- **インデックス**: `resolvedAt`
- **用途**: 競合解決履歴の保存

## 🎬 イベント一覧

| イベント名         | 発火タイミング   | ペイロード                              |
| ------------------ | ---------------- | --------------------------------------- |
| `initialized`      | 初期化完了時     | なし                                    |
| `online`           | オンライン復帰時 | なし                                    |
| `offline`          | オフライン時     | なし                                    |
| `actionRecorded`   | アクション記録時 | `OfflineAction`                         |
| `syncStarted`      | 同期開始時       | なし                                    |
| `syncCompleted`    | 同期完了時       | `{ processed, conflicts }`              |
| `conflictDetected` | 競合検出時       | `{ action, conflicts, conflictId }`     |
| `conflictResolved` | 競合解決時       | `{ conflictId, resolution, finalData }` |
| `syncFailed`       | 同期失敗時       | `{ action, error }`                     |

## 🔧 API Reference

### offlineManager.recordAction(action)

オフライン操作を記録します。

**Parameters:**

- `action`: 記録するアクション
  - `type`: `'create' | 'update' | 'delete'`
  - `entity`: エンティティ名（例: `'tasks'`, `'events'`）
  - `data`: アクションデータ

**Returns:** `Promise<string>` - アクションID

### offlineManager.getPendingActions()

同期待ちのアクション一覧を取得します。

**Returns:** `Promise<OfflineAction[]>`

### offlineManager.getConflictingActions()

競合が発生したアクション一覧を取得します。

**Returns:** `Promise<OfflineAction[]>`

### offlineManager.resolveConflict(conflictId, resolution)

競合を解決します。

**Parameters:**

- `conflictId`: 競合ID
- `resolution`: 解決方法
  - `choice`: `'local' | 'server' | 'merge'`
  - `mergedData?`: マージしたデータ（choice が 'merge' の場合）

**Returns:** `Promise<SyncResult>`

### offlineManager.getStatus()

現在のステータスを取得します。

**Returns:** `OfflineManagerStatus`

```typescript
{
  isOnline: boolean
  isInitialized: boolean
  syncInProgress: boolean
  queueSize: number
}
```

### offlineManager.clearCompletedActions()

完了済みアクションをクリアします。

**Returns:** `Promise<void>`

### offlineManager.on(event, callback)

イベントリスナーを登録します。

**Parameters:**

- `event`: イベント名
- `callback`: コールバック関数

### offlineManager.off(event, callback)

イベントリスナーを削除します。

**Parameters:**

- `event`: イベント名
- `callback`: コールバック関数

## 🧪 テスト

```bash
# テスト実行
npm run test:run src/features/offline/services/offline-manager.test.ts

# カバレッジ確認
npm run test:coverage
```

## 📚 関連ドキュメント

- [コーディング規約](../../../CLAUDE.md)
- [機能モジュール構造](../CLAUDE.md)
- [オフライン同期フック](../../../hooks/useOfflineSync.tsx)

---

**最終更新**: 2025-10-06
