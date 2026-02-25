---
name: cleanup
description: 不要コード削除スキル。console.log検出、未使用import/export、デッドコード検出時に自動発動。安全な削除手順を支援。
allowed-tools: Read, Grep, Glob, Bash
---

## 現在のコード品質状態

### Lint結果

!`npm run lint 2>&1 | tail -30`

### TODO/FIXME/HACK コメント

!`grep -rn "TODO\|FIXME\|HACK\|@deprecated" src/ --include="*.ts" --include="*.tsx" | head -30`

---

# 不要コード削除スキル

上記の自動収集結果を踏まえて、不要コードの検出と安全な削除を行う。

## 検出対象と手段

### 1. console.log / デバッグコード

ESLint `no-console` ルールで検出（`console.warn`/`console.error` は許可）。

```bash
npm run lint
```

**例外**（ESLint設定で除外済み）:

- `src/lib/logger.ts` — 開発用ログモジュール
- `scripts/**` — CLIツール
- `src/test/**`, `**/*.test.ts` — テストファイル
- `**/components/dev/**` — 開発専用コンポーネント

**置き換えパターン**:

```typescript
// ❌ 本番に残してはいけない
console.log('debug:', data);

// ✅ logger を使う
import { logger } from '@/lib/logger';
logger.log('debug:', data); // 開発環境のみ出力
logger.error('Failed:', err); // 全環境で出力
```

### 2. 未使用のimport / 変数

TypeScript strict mode + ESLint で検出：

```bash
npm run typecheck  # noUnusedLocals, noUnusedParameters
npm run lint       # @typescript-eslint/no-unused-vars
```

### 3. 未使用のexport / ファイル

手動検出（Grep ツールで参照箇所を確認）:

1. 対象のexport名でプロジェクト全体を検索
2. import元が自身のファイルだけ → 未使用の可能性
3. `index.ts` の re-export のみ → バレルファイル経由の参照も確認

### 4. デッドコード

- 到達不能なコードパス（`if (false)` 等）
- コメントアウトされたコード
- `@deprecated` 付きで参照ゼロのコード

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

Grep ツールで参照箇所を検索：

- 対象の関数名/型名/変数名でプロジェクト全体を検索
- テストファイルへの影響を確認
- `index.ts` バレルファイルからの re-export を確認

### Step 2: 段階的な削除

1. まず export を削除（内部関数化）
2. `npm run typecheck` で参照エラーを確認
3. エラーがなければファイル全体を削除

### Step 3: 検証

```bash
npm run typecheck  # 型エラーなし
npm run lint       # Lintエラーなし
```

## Dayopt 固有のパターン

### 未使用の Zustand selector

```typescript
// ❌ 使われていない selector
export const useUnusedSelector = () => useStore((s) => s.unused);

// Grep で "useUnusedSelector" を検索 → 参照なしなら削除
```

### 未使用の tRPC エンドポイント

```typescript
// ❌ 呼び出されていないエンドポイント
unusedEndpoint: protectedProcedure.query(() => { ... })

// Grep で "api.example.unusedEndpoint" を検索 → 参照なしなら削除
```

### 未使用の i18n キー

messages ファイルにキーがあるが、コード側で参照がない場合：

```bash
npm run i18n:unused  # 未使用翻訳キーの検出
```

## なぜ削除するのか

| 問題       | 影響                                           |
| ---------- | ---------------------------------------------- |
| 認知負荷   | 「これは使われているのか？」と悩む             |
| 保守コスト | 変更時に不要なコードも考慮が必要               |
| バグリスク | 使われていないと思ったコードが実は使われていた |

**YAGNI原則**: 「いつか使うかも」で残さない。必要になったらまた作る。

## 出力形式

```markdown
## 削除レポート

### 検出した不要コード

| ファイル             | 種別         | 理由           |
| -------------------- | ------------ | -------------- |
| `path/to/file.ts`    | 未使用export | 参照0件        |
| `path/to/util.ts:42` | console.log  | デバッグコード |

### 削除したファイル

- `path/to/file1.ts` — 理由
- `path/to/file2.ts` — 理由

### 削除したコード

- `functionName` in `file.ts` — 理由

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

## 関連スキル

- `/refactor` — 大規模リファクタリング
