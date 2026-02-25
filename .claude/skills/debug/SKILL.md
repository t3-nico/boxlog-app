---
name: debug
description: デバッグスキル。エラー発生時、予期しない動作の報告時に自動発動。体系的な原因特定と修正を支援。
---

# デバッグスキル

問題を調査し、原因を特定して修正するスキル。

## When to Use（自動発動条件）

以下の状況で自動発動：

- エラーが発生した時
- 予期しない動作が報告された時
- 「デバッグ」「バグ」「エラー」「動かない」「おかしい」キーワード

## デバッグワークフロー

### Phase 0: 調査（investigate）

バグ修正でなく「調べて」「仕様確認」の場合はここから:

**情報源の優先順位**: 公式ドキュメント（WebFetch）→ 既存実装（Grep）→ 学習済みパターン（`.claude/sessions/learned/`）→ 型定義（`node_modules/*.d.ts`）

**調査テンプレート**:

- **外部API**: 認証方式、エンドポイント一覧、レート制限、SDK推奨
- **ライブラリ導入**: Stars 1000+/最終コミット6ヶ月以内を確認（CLAUDE.md依存関係ルール）
- **コードベース構造**: 関連ファイル → データフロー → 型定義 → 注意点

### Phase 1: 問題の理解

1. **エラーメッセージを確認**
   - 完全なスタックトレースを取得
   - エラーの種類を特定（型エラー、ランタイムエラー、ネットワークエラー等）

2. **再現手順を把握**
   - いつ発生するか
   - どの操作で発生するか
   - 常に発生するか、時々か

3. **期待される動作を確認**
   - 本来どうなるべきか

### Phase 2: 原因の調査

```bash
# 1. 関連コードを検索
grep -r "エラーメッセージの一部" src/

# 2. 最近の変更を確認
git log --oneline -20
git diff HEAD~5

# 3. 該当ファイルの変更履歴
git log -p path/to/file.ts
```

### Phase 3: 仮説の検証

1. **最も可能性の高い原因から検証**
2. **console.log / デバッガで確認**
3. **単体テストで動作確認**
4. **段階的に原因を絞り込み**

### Phase 4: 修正と検証

```bash
# 最小限の修正で対応
# 型チェック実行
npm run typecheck

# 既存テストが通ることを確認
npm run test
```

## Think ツール活用

問題の複雑さに応じて使い分け：

| 複雑さ | コマンド     | 使用場面                             |
| ------ | ------------ | ------------------------------------ |
| 簡単   | `think`      | 明らかなバグ、タイポ                 |
| 中程度 | `think hard` | ロジックエラー、状態管理の問題       |
| 複雑   | `ultrathink` | アーキテクチャに関わる問題、競合状態 |

## Dayopt固有のデバッグパターン

### tRPCエラー

```typescript
// よくある原因
// 1. 認証エラー（protectedProcedureで未ログイン）
// 2. Zodバリデーションエラー（入力形式）
// 3. Supabaseエラー（DB制約違反）

// デバッグ方法
// サーバーログを確認
console.error('[tRPC Error]', error);

// クライアントでエラー詳細を確認
const { error } = api.myRouter.myEndpoint.useQuery();
console.log(error?.message, error?.data);
```

### Zustand状態の問題

```typescript
// DevToolsで状態を確認
// ブラウザのRedux DevToolsで "zustand" を選択

// ログで状態変化を追跡
const useMyStore = create<MyState>()(
  devtools(
    (set) => ({
      // ...
    }),
    { name: 'MyStore' },
  ),
);
```

### カレンダードラッグの問題

```typescript
// 参照: .claude/sessions/learned/drag-*.md
// よくある問題:
// 1. イベント伝播（stopPropagation漏れ）
// 2. 座標計算（getBoundingClientRect）
// 3. 状態の競合（useCalendarDragStore）
```

### Supabaseエラー

```typescript
// よくあるエラーコード
// PGRST116: 行が見つからない
// 23505: 一意制約違反
// 42501: 権限エラー（RLS）

// RLSポリシーの確認
// supabase/migrations/ 内のポリシーを確認
```

### hydrationエラー

```typescript
// よくある原因
// 1. サーバーとクライアントで異なる値（Date.now()等）
// 2. localStorage/sessionStorageの参照
// 3. window/documentの直接参照

// 対処法
// 1. useEffect内で副作用を実行
// 2. dynamic importでSSRを無効化
// 3. suppressHydrationWarning（最終手段）
```

## 学習パターンの活用

```bash
# 過去の解決パターンを確認
ls .claude/sessions/learned/

# 関連パターンを読み込み
# - zustand-*.md: Zustand関連
# - trpc-*.md: tRPC関連
# - calendar-*.md: カレンダー関連
# - drag-*.md: ドラッグ関連
# - typescript-*.md: 型エラー
```

## よくあるエラーと対処法

| エラー                                   | 原因               | 対処                                |
| ---------------------------------------- | ------------------ | ----------------------------------- |
| `Type 'X' is not assignable to type 'Y'` | 型の不一致         | 型定義を確認、as / satisfies を検討 |
| `Cannot read properties of undefined`    | null/undefined参照 | Optional chainingを使用             |
| `Hydration failed`                       | SSR/CSR不一致      | useEffectに移動、dynamic import     |
| `TRPCClientError`                        | API呼び出し失敗    | サーバーログ確認、入力値確認        |
| `RLS violation`                          | Supabase権限       | ポリシー確認、userId確認            |

## 出力形式

```markdown
## デバッグ結果

### 問題の概要

[問題の説明]

### 再現手順

1. [手順1]
2. [手順2]

### 原因

[根本原因の説明]

### 修正内容

- `path/to/file.ts:42` - [修正内容]

### 確認方法

[動作確認の手順]

### 学習パターン

[今回学んだパターン（`.claude/sessions/learned/`に保存を検討）]
```

## チェックリスト

デバッグ前：

- [ ] エラーメッセージを完全に把握したか
- [ ] 再現手順を確認したか

デバッグ中：

- [ ] 最も可能性の高い原因から検証しているか
- [ ] 変更は最小限か

デバッグ後：

- [ ] `npm run typecheck` が通るか
- [ ] `npm run test` が通るか
- [ ] 同様の問題が再発しない対策を考えたか

## 関連スキル

- `/test` - 回帰テストの作成
- `/fix-types` - 型エラー修正（コマンド）
