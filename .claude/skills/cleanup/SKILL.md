---
name: cleanup
description: 不要コード削除スキル。console.log検出、未使用import、デッドコード検出時に自動発動。安全な削除手順を支援。
---

# 不要コード削除スキル

不要なコード、ファイル、機能を安全に削除するスキル。

## When to Use（自動発動条件）

以下の状況で自動発動：

- console.log が残っている時
- ESLintで未使用import警告が出た時
- knipで未使用export検出時
- コメントアウトされたコードを検出した時
- 「クリーンアップ」「削除」「不要」キーワード

## 検出対象

### 1. console.log / デバッグコード

```bash
# 検出
grep -rn "console\." src/ --include="*.ts" --include="*.tsx"
```

**例外**:

- `src/lib/logger.ts` 内の意図的なログ
- エラーハンドリング内の `console.error`

### 2. 未使用のexport

```bash
# knipで検出
npx knip --reporter=compact
```

### 3. 未使用のimport

```bash
# ESLintで検出
npm run lint -- --rule 'no-unused-vars: error'
```

### 4. デッドコード

- 到達不能なコードパス（`if (false)` 等）
- 使われていない変数・引数
- コメントアウトされたコード

### 5. 古いコメント

| マーカー      | 確認内容             |
| ------------- | -------------------- |
| `TODO`        | 実装済みか確認       |
| `FIXME`       | 修正済みか確認       |
| `HACK`        | リファクタリング対象 |
| `@deprecated` | 削除可能か確認       |

### 6. 不要なファイル

- `.bak`, `.old`, `.tmp` ファイル
- 重複した型定義
- 空のindex.ts（re-exportのみで使われていない）

## 削除手順

### Step 1: 影響範囲の確認

```bash
# 参照を検索
grep -r "import.*対象" src/

# テストファイルへの影響
grep -r "対象" src/**/__tests__/
```

### Step 2: 段階的な削除

```
1. まずexportを削除（内部関数化）
2. npm run typecheck で参照エラーを確認
3. エラーがなければファイル全体を削除
```

### Step 3: 検証

```bash
npm run typecheck  # 型エラーなし
npm run lint       # Lintエラーなし
```

## Dayopt固有のパターン

### console.log削除

```typescript
// ❌ 本番に残してはいけない
console.log('debug:', data);
console.log('here');

// ✅ 意図的なログ（許可）
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode');
}
```

### 未使用のZustand selector

```typescript
// ❌ 使われていないselector
export const useUnusedSelector = () => useStore((s) => s.unused);

// 検出: grep -r "useUnusedSelector" src/
// 参照がなければ削除
```

### 未使用のtRPCエンドポイント

```typescript
// server/routers/example.ts
// ❌ 呼び出されていないエンドポイント
unusedEndpoint: protectedProcedure.query(() => { ... })

// 検出: grep -r "api.example.unusedEndpoint" src/
// 参照がなければ削除
```

## なぜ削除するのか

不要なコードを残すデメリット：

| 問題         | 影響                                           |
| ------------ | ---------------------------------------------- |
| 認知負荷     | 「これは使われているのか？」と悩む             |
| 保守コスト   | 変更時に不要なコードも考慮が必要               |
| バグのリスク | 使われていないと思ったコードが実は使われていた |

**YAGNI原則**: 「いつか使うかも」で残さない。必要になったらまた作る。

## 自動検出ツール

```bash
# ESLint未使用変数検出
npm run lint -- --rule 'no-unused-vars: error'

# TypeScript未使用エクスポート
npx knip

# console.log検出
grep -rn "console\." src/ --include="*.ts" --include="*.tsx"

# コメントアウトされたコード
grep -rn "// .*function\|// .*const\|// .*export" src/
```

## 出力形式

```markdown
## 削除レポート

### 検出した不要コード

| ファイル             | 種別         | 理由           |
| -------------------- | ------------ | -------------- |
| `path/to/file.ts`    | 未使用export | 参照0件        |
| `path/to/util.ts:42` | console.log  | デバッグコード |

### 削除したファイル

- `path/to/file1.ts` - 理由
- `path/to/file2.ts` - 理由

### 削除したコード

- `functionName` in `file.ts` - 理由

### 検証結果

- typecheck: PASS
- lint: PASS
```

## チェックリスト

削除前：

- [ ] 参照箇所を確認したか
- [ ] テストへの影響を確認したか

削除後：

- [ ] `npm run typecheck` が通るか
- [ ] `npm run lint` が通るか
- [ ] 関連する画面が正常に動作するか

## 関連スキル

- `/refactor` - 大規模リファクタリング
- `/weekend-remote` - 不要コード検出タスク化
