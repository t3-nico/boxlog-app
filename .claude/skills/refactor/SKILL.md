---
name: refactor
description: リファクタリングスキル。パターン統一、構造改善、技術的負債解消時に自動発動。段階的移行と影響範囲分析を支援。
---

# リファクタリングスキル

大規模なコード改善を安全に実行するためのスキル。

## When to Use（自動発動条件）

以下の状況で自動発動：

- 複数の類似実装を統合する時
- ディレクトリ構造を再編成する時
- 技術的負債を解消する時
- 「リファクタリング」「リファクタ」「構造改善」「統一」キーワード

## 基本原則

### 1. Big Bang禁止

```
❌ 一度に全部変える
✅ 段階的に移行する
```

大規模な変更は必ず段階的に行う。各段階で動作確認できる状態を維持。

### 2. YAGNI原則

```
❌ 「いつか使うかも」で残す
✅ 不要なら削除、必要になったら作る
```

### 3. GAFA-first

既存のパターン・規約に従う。独自の改善より標準に寄せる。

## リファクタリングワークフロー

### Phase 1: 影響範囲分析

```bash
# 1. 対象コードの参照を検索
grep -r "対象の関数/コンポーネント名" src/

# 2. インポート関係を確認
grep -r "import.*from.*対象ファイル" src/

# 3. テストファイルへの影響
ls src/**/__tests__/*.test.ts
```

### Phase 2: 計画策定

以下を明確にする：

1. **ゴール**: 何を達成するか
2. **スコープ**: どこまで変更するか
3. **ステップ**: どの順序で進めるか
4. **ロールバック**: 問題発生時の対処

### Phase 3: 段階的実行

```
Step 1: 新しいパターンを追加（既存は残す）
Step 2: 新パターンへ移行（1ファイルずつ）
Step 3: 動作確認（typecheck + lint + 手動確認）
Step 4: 古いパターンを削除
Step 5: 最終確認
```

### Phase 4: 検証

```bash
npm run typecheck  # 型エラーなし
npm run lint       # Lintエラーなし
```

## よくあるリファクタリングパターン

### パターン1: 関数/コンポーネントの統合

```typescript
// Before: 類似した2つの関数
function formatDateA(date: Date) { ... }
function formatDateB(date: Date) { ... }

// After: 統一された1つの関数
function formatDate(date: Date, options?: FormatOptions) { ... }
```

**手順**:

1. 新しい統一関数を作成
2. 呼び出し元を1つずつ移行
3. 古い関数を削除

### パターン2: ディレクトリ構造の変更

```
# Before
src/components/MyComponent.tsx
src/components/MyComponent.test.tsx

# After
src/features/my-feature/components/MyComponent.tsx
src/features/my-feature/components/__tests__/MyComponent.test.tsx
```

**手順**:

1. 新しいディレクトリを作成
2. ファイルを移動（git mv を使用）
3. インポートパスを更新
4. 空になったディレクトリを削除

### パターン3: 型定義の整理

```typescript
// Before: 散らばった型定義
// file1.ts
type User = { ... }
// file2.ts
type User = { ... }  // 重複

// After: 集約された型定義
// types/user.ts
export type User = { ... }
```

**手順**:

1. 集約先ファイルを作成
2. 型定義を移動
3. インポートを更新
4. 重複を削除

## Dayopt固有のパターン

### Feature構造への統一

```
src/features/{feature-name}/
├── components/
├── hooks/
├── stores/
├── types/
└── utils/
```

既存の散らばったコードをFeature構造に移行する際は `/feature-scaffolding` を参照。

### tRPCルーターの整理

```
src/server/routers/
├── {domain}.ts        # ルーター定義
└── services/{domain}/ # ビジネスロジック
```

Service層への分離は `/trpc-router-creating` を参照。

## 禁止事項

### ❌ リファクタリング中に新機能追加

```
リファクタリングと新機能追加は別のPRで行う
```

### ❌ テストなしでのリファクタリング

```
動作確認できない状態での大規模変更は禁止
最低限 typecheck + lint が通ること
```

### ❌ コミットせずに大量変更

```
こまめにコミットする（ロールバック可能にする）
```

## チェックリスト

リファクタリング前：

- [ ] ゴールが明確か
- [ ] 影響範囲を把握したか
- [ ] 段階的な計画があるか

リファクタリング中：

- [ ] 各ステップで動作確認しているか
- [ ] こまめにコミットしているか

リファクタリング後：

- [ ] `npm run typecheck` が通るか
- [ ] `npm run lint` が通るか
- [ ] 削除漏れはないか

## 関連スキル

- `/cleanup` - 不要コード削除
- `/architecture` - 設計相談
- `/learn-pattern` - パターン学習・保存
