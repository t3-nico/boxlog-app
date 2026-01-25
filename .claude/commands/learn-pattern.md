# /learn-pattern - パターン学習コマンド

セッション中に発見したパターンやノウハウを `.claude/sessions/learned/` に保存します。

## 実行手順

1. **パターンの特定**
   - 今解決した問題は何か？
   - どのようなアプローチが有効だったか？
   - なぜそのアプローチが必要だったか？

2. **パターンファイルの作成**
   以下の形式で `.claude/sessions/learned/` に保存:

   ```markdown
   # [パターン名]

   ## Problem

   [どんな問題が発生したか]

   ## Solution

   [どう解決したか - コード例含む]

   ## Why It Works

   [なぜこのアプローチが有効か]

   ## When to Use

   [どんな状況で使うべきか]

   ## Related Files

   [関連するファイルパス]
   ```

3. **ファイル名規則**
   - kebab-case を使用
   - カテゴリプレフィックス: `zustand-`, `trpc-`, `next-`, `calendar-`, etc.
   - 例: `zustand-optimistic-update-pattern.md`

## 例

### 入力

```
/learn-pattern Zustandの楽観的更新でキャッシュがundefinedになる問題を解決した
```

### 出力ファイル

`.claude/sessions/learned/zustand-optimistic-update-undefined-cache.md`

```markdown
# Zustand Optimistic Update - Undefined Cache Handling

## Problem

楽観的更新時に `setData` の初期値が undefined の場合、
更新処理が失敗する

## Solution

必ず undefined チェックを入れる:
\`\`\`typescript
utils.myRouter.list.setData(undefined, (old) => {
if (!old) return old; // ← この行が重要
return [...old, newItem];
});
\`\`\`

## Why It Works

TanStack Query のキャッシュが初期化されていない場合、
`old` が undefined になる。この場合は更新をスキップして
invalidate に任せる。

## When to Use

- すべての楽観的更新の `onMutate` 内
- 特に create/update mutation で必須

## Related Files

- src/features/tags/hooks/useTags.ts
- src/features/plans/hooks/usePlanMutations.ts
```

## 注意事項

- 一般的すぎるパターンは保存しない（公式ドキュメントに書いてあるレベル）
- BoxLog 固有の知見を優先
- 同じパターンが既にある場合は更新する
