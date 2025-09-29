# 状態管理パターン移行計画

## 📋 既存ストアの分析結果

### 現在の状況
- **総ストア数**: 20個（パターンファイル除く）
- **主要機能領域**: 8領域（tasks、tags、boxes、calendar、navigation、trash、events、settings）
- **共通問題**: 非統一なパターン、型安全性の不備、DevTools未統合

### 移行優先度付きリスト

#### 🔴 高優先度（即座移行）
1. **useTaskStore** - 複雑なpersistロジック、Date型の手動変換
2. **useTagStore** - 大規模データ、階層構造管理
3. **useBoxStore** - 基本的だが重要な機能

#### 🟡 中優先度（段階的移行）
4. **useEventStore** - カレンダー機能の重要性
5. **useRecordsStore** - データ同期の複雑性
6. **navigation.store** - UIの一貫性

#### 🟢 低優先度（後回し可能）
7-20. **その他のストア** - 小規模・シンプルな機能

## 🔄 移行戦略

### Phase 1: Foundation（週1）
- [x] 基本パターンの実装
- [x] ファクトリーシステムの構築
- [x] 実装例（task-store.ts）の作成

### Phase 2: High-Priority Migration（週2-3）
- [ ] useTaskStore の新パターンへの移行
- [ ] useTagStore の新パターンへの移行
- [ ] useBoxStore の新パターンへの移行

### Phase 3: Progressive Migration（週4-6）
- [ ] 中優先度ストアの移行
- [ ] 既存コンポーネントの新ストア対応
- [ ] テストの追加・更新

### Phase 4: Cleanup & Documentation（週7-8）
- [ ] 低優先度ストアの移行
- [ ] 旧パターンの削除
- [ ] ドキュメント整備

## 🛠️ 具体的な移行手順

### useTaskStore 移行（最優先）

#### 現在の問題
```typescript
// ❌ 現在の実装の問題点
// 1. Date型の手動変換（複雑なストレージ処理）
// 2. エラーハンドリングの不備
// 3. DevTools未統合
// 4. 型安全性の問題
// 5. 非統一なアクション命名
```

#### 移行後の改善
```typescript
// ✅ 新パターンでの改善点
export const useTaskStoreV2 = StoreFactory.createPersisted<TaskState>({
  type: 'persisted',
  name: 'task-store-v2',
  initialState: {
    tasks: [],
    filters: { /* ... */ },
    sorting: { /* ... */ }
  },
  persist: {
    name: 'boxlog-tasks',
    storage: 'localStorage',
    version: 2,
    migrate: (persistedState, version) => {
      // 自動マイグレーション処理
      if (version === 1) {
        return migrateV1ToV2(persistedState)
      }
      return persistedState
    }
  },
  actions: (set, get) => ({
    // 統一されたアクション実装
    createTask: async (input) => { /* ... */ },
    updateTask: async (id, updates) => { /* ... */ },
    deleteTask: async (id) => { /* ... */ }
  })
})
```

### useTagStore 移行

#### 移行計画
```typescript
// 階層構造を維持しつつ新パターンへ移行
export const useTagStoreV2 = StoreFactory.createPersisted<TagState>({
  type: 'persisted',
  name: 'tag-store-v2',
  initialState: {
    tags: [],
    hierarchy: new Map(),
    cache: new Map()
  },
  persist: {
    name: 'boxlog-tags',
    storage: 'localStorage',
    version: 2,
    partialize: (state) => ({
      tags: state.tags,
      // キャッシュは永続化しない
    })
  },
  actions: (set, get) => ({
    // 階層管理の最適化
    buildHierarchy: () => { /* ... */ },
    addTag: async (tag) => { /* ... */ },
    updateHierarchy: () => { /* ... */ }
  })
})
```

### useBoxStore 移行

#### シンプルな移行
```typescript
// フィルター管理の統一化
export const useBoxStoreV2 = StoreFactory.create<BoxState>({
  type: 'base',
  name: 'box-store-v2',
  initialState: {
    filters: { /* ... */ },
    view: 'list',
    selection: []
  },
  actions: (set, get) => ({
    // 統一されたフィルター管理
    setFilter: (key, value) => { /* ... */ },
    resetFilters: () => { /* ... */ },
    toggleSelection: (id) => { /* ... */ }
  })
})
```

## 📊 移行進捗追跡

### チェックリスト

#### useTaskStore 移行
- [ ] 新ストア実装
- [ ] データマイグレーション関数
- [ ] 既存コンポーネント更新
- [ ] テスト追加
- [ ] 旧ストア削除

#### useTagStore 移行
- [ ] 新ストア実装
- [ ] 階層構造最適化
- [ ] 既存コンポーネント更新
- [ ] テスト追加
- [ ] 旧ストア削除

#### useBoxStore 移行
- [ ] 新ストア実装
- [ ] フィルター統一化
- [ ] 既存コンポーネント更新
- [ ] テスト追加
- [ ] 旧ストア削除

## 🧪 テスト戦略

### ユニットテスト
```typescript
// パターン別テスト実装
describe('TaskStore Migration', () => {
  it('should migrate v1 data to v2 format', () => { /* ... */ })
  it('should preserve all existing functionality', () => { /* ... */ })
  it('should handle Date serialization correctly', () => { /* ... */ })
})
```

### 統合テスト
- 既存コンポーネントとの互換性
- データ移行の正確性
- パフォーマンスの維持

### E2Eテスト
- 主要ユーザーフローの動作確認
- データ永続化の検証

## 📈 成功指標

### 技術指標
- [ ] 型安全性: 100%（`any`型ゼロ）
- [ ] DevTools統合: 全ストア対応
- [ ] コード重複: 80%削減
- [ ] エラーハンドリング: 統一化

### ユーザー体験指標
- [ ] データ移行: 100%成功
- [ ] 既存機能: 100%互換性維持
- [ ] パフォーマンス: 現状維持以上
- [ ] バグ: 移行に起因する新規バグゼロ

## 🚨 リスク管理

### 高リスク
1. **データロス**: バックアップ機能の実装必須
2. **既存機能破綻**: 段階的移行とテストの徹底
3. **パフォーマンス劣化**: ベンチマーク測定

### 軽減策
- 移行前の自動バックアップ
- フィーチャーフラグによる段階的切り替え
- ロールバック機能の実装

## 📝 次のアクション

### 即座実行
1. useTaskStore移行の開始
2. データマイグレーション機能の実装
3. バックアップシステムの構築

### 今週中
1. useTaskStore移行完了
2. useTagStore移行開始
3. 移行テストの実行

### 来週以降
1. 残りストアの段階的移行
2. ドキュメント整備
3. チーム向け移行ガイドライン作成