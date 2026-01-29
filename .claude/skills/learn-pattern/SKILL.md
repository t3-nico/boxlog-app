---
name: learn-pattern
description: パターン学習スキル。難しい問題を解決した時、Dayopt固有の回避策を発見した時、非自明なアプローチが有効だった時に自動発動。学んだパターンを .claude/sessions/learned/ に保存。
---

# パターン学習スキル

セッション中に発見したパターンやノウハウを `.claude/sessions/learned/` に保存する。

## When to Use（自動発動条件）

以下の状況で自動発動：

- 難しいバグを解決した時
- Dayopt固有の回避策を発見した時
- 非自明なアプローチが有効だった時
- 「これはパターンとして覚えておくべき」と判断した時

## 発動時の確認

自動発動時は、まずユーザーに確認する：

```
💡 このアプローチはDayopt固有のパターンとして記録する価値がありそうです。
保存しますか？

パターン名（仮）: [パターン名]
カテゴリ: zustand / trpc / next / calendar / drag / typescript / other
```

## パターンファイル形式

`.claude/sessions/learned/` に以下の形式で保存：

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

## ファイル名規則

- kebab-case を使用
- カテゴリプレフィックス: `zustand-`, `trpc-`, `next-`, `calendar-`, `drag-`, `typescript-`
- 例: `zustand-optimistic-update-undefined-cache.md`

## 保存基準

### 保存する

- Dayopt固有の知見
- 公式ドキュメントに載っていないワークアラウンド
- 同じ問題で2回以上ハマった内容

### 保存しない

- 一般的すぎるパターン（公式ドキュメントレベル）
- 一時的な対処（根本解決が別にある場合）

## 既存パターンとの重複

同じパターンが既にある場合は、新しい知見を追記して更新する。

## カテゴリ別の例

| カテゴリ      | 例                                           |
| ------------- | -------------------------------------------- |
| `zustand-`    | 楽観的更新のundefinedハンドリング            |
| `trpc-`       | protectedProcedureでのctx.userId取得パターン |
| `next-`       | Server/Client Component境界でのprops受け渡し |
| `calendar-`   | ドラッグ中のスナップ計算                     |
| `drag-`       | dnd-kitのセンサー設定                        |
| `typescript-` | 複雑なジェネリクスの型パズル                 |
