---
name: investigate
description: API/コード調査スキル。外部API連携、ライブラリ導入、コードベース構造理解が必要な時に自動発動。公式ドキュメントと既存実装パターンを調査して報告。
---

# API/コード調査スキル

## When to Use

以下の状況で自動発動：

- 外部API連携の実装時（Google Calendar等）
- 新しいライブラリの導入検討時
- 「調べて」「調査して」「仕様を確認して」等のキーワード

## When NOT to Use

- 既知の技術の実装（`/new-feature`を使用）
- バグ修正（`/debug`を使用）

## 調査ワークフロー

### 情報源の優先順位

```
1. 公式ドキュメント [最優先]
   └─ WebFetch で取得

2. 既存実装パターン
   └─ プロジェクト内検索（Grep, Glob）

3. 学習済みパターン
   └─ .claude/sessions/learned/ を確認

4. 型定義
   └─ node_modules内の.d.ts
```

## 調査タイプ別テンプレート

### 外部API調査

```markdown
## 調査結果: [API名]

### 認証方法

- 方式: OAuth 2.0 / API Key / ...
- 必要なスコープ: ...

### 主要エンドポイント

| エンドポイント | 用途 | メソッド |
| -------------- | ---- | -------- |
| /api/v1/...    | ...  | GET/POST |

### 制限事項

- レート制限: X requests/minute
- クォータ: ...

### SDK

- 推奨: @xxx/xxx (npm)

### Dayoptへの適用

- 環境変数: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- 実装場所: `src/server/services/google/`
```

### ライブラリ調査

```markdown
## 調査結果: [ライブラリ名]

### 基本情報

| 項目           | 値             |
| -------------- | -------------- |
| npm            | [パッケージ名] |
| GitHub Stars   | X              |
| 最終更新       | YYYY-MM-DD     |
| バンドルサイズ | X KB           |

### CLAUDE.md依存関係ルールとの整合性

- [ ] Stars 1000以上
- [ ] 最終コミット6ヶ月以内
- [ ] 既存依存で代替不可

### 使い方

[基本的なコード例]

### 推奨

- 採用 / 不採用 / 要検討
- 理由: ...
```

### コードベース構造調査

```markdown
## 調査結果: [調査対象]

### 関連ファイル

- `src/features/xxx/...`
- `src/server/routers/xxx/...`

### データフロー

[Component] → [Hook] → [tRPC] → [Service]

### 型定義

| 型名 | 定義場所 | 役割 |
| ---- | -------- | ---- |
| ...  | ...      | ...  |

### 実装時の注意点

- ...
```

## 調査ツールの使い分け

| 目的                 | ツール                           |
| -------------------- | -------------------------------- |
| 外部ドキュメント取得 | WebFetch                         |
| ファイル検索         | Glob                             |
| コード検索           | Grep                             |
| 学習パターン確認     | Read `.claude/sessions/learned/` |

## Dayopt固有ルール

1. **外部APIキーは環境変数で管理** - `.env.local` に追加
2. **CLAUDE.md「依存関係の運用」を確認** - 新規ライブラリ導入前
3. **既存パターンとの整合性を重視** - tRPC, Zustand, Feature構造
