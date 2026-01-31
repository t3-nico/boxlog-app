# Claude Skills

Dayoptプロジェクト固有のスキル集。各スキルは特定のタスクで自動発動し、一貫したパターンで実装を支援する。

## スキル一覧

### 実装系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`store-creating`](store-creating/SKILL.md) | Zustandストア作成 | 新しいストアが必要な時 |
| [`trpc-router-creating`](trpc-router-creating/SKILL.md) | tRPCルーター作成 | 新しいAPIエンドポイントが必要な時 |
| [`optimistic-update`](optimistic-update/SKILL.md) | 楽観的更新実装 | mutation実装時 |
| [`feature-scaffolding`](feature-scaffolding/SKILL.md) | Feature構造作成 | 新機能モジュール作成時 |
| [`i18n`](i18n/SKILL.md) | 国際化対応 | UIテキスト追加時 |

### 品質系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`test`](test/SKILL.md) | テスト作成 | 新機能実装後、バグ修正後 |
| [`security`](security/SKILL.md) | セキュリティ監査 | 認証/認可、入力処理実装時 |
| [`a11y`](a11y/SKILL.md) | アクセシビリティ | インタラクティブ要素実装時 |
| [`react-best-practices`](react-best-practices/SKILL.md) | React最適化 | コンポーネント実装時 |

### 改善系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`refactor`](refactor/SKILL.md) | リファクタリング | パターン統一、構造改善時 |
| [`cleanup`](cleanup/SKILL.md) | 不要コード削除 | console.log検出、未使用import発見時 |
| [`debug`](debug/SKILL.md) | デバッグ | エラー発生時、予期しない動作報告時 |

### 設計・調査系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`architecture`](architecture/SKILL.md) | 設計相談 | 複雑な機能の計画時 |
| [`investigate`](investigate/SKILL.md) | API/コード調査 | 外部API連携、ライブラリ導入時 |
| [`frontend-design`](frontend-design/SKILL.md) | UIデザイン指針 | UI設計判断が必要な時 |

### ドキュメント・運用系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`docs`](docs/SKILL.md) | ドキュメント作成 | 技術ドキュメント、ADR作成時 |
| [`releasing`](releasing/SKILL.md) | リリース作業 | バージョンリリース時 |
| [`learn-pattern`](learn-pattern/SKILL.md) | パターン学習・保存 | 難しい問題を解決した時 |

### 判断系

| スキル | 説明 | 自動発動条件 |
|--------|------|-------------|
| [`model-selection`](model-selection/SKILL.md) | モデル選択 | タスクに応じたモデル選択時 |
| [`ask-questions-if-underspecified`](ask-questions-if-underspecified/SKILL.md) | 要件確認 | 仕様が曖昧な時 |

## スキルの構造（テンプレート）

```markdown
---
name: skill-name
description: スキルの説明。自動発動条件を含める。
---

# スキル名

スキルの概要（1-2文）

## When to Use（自動発動条件）

- 条件1
- 条件2
- 「キーワード」キーワード

## When NOT to Use（任意）

- 使用しないケース

## [本文セクション]

実装パターン、ガイドラインなど

## チェックリスト

- [ ] チェック項目1
- [ ] チェック項目2

## 関連スキル

- `/related-skill-1` - 説明
- `/related-skill-2` - 説明
```

## スキルの命名規則

- **kebab-case** を使用（例: `store-creating`, `trpc-router-creating`）
- 動詞+名詞 または 名詞のみ
- 日本語は使用しない

## CLAUDE.mdとの関係

| ドキュメント | 役割 | 内容 |
|-------------|------|------|
| **CLAUDE.md** | 「何を」「なぜ」 | クイックチェック、禁止事項、方針 |
| **Skills** | 「どうやって」 | 詳細なコードテンプレート、手順 |

CLAUDE.mdは簡潔に保ち、詳細はSkillに委譲する。

## 新規スキル作成時

1. `.claude/skills/{skill-name}/SKILL.md` を作成
2. frontmatter（name, description）を設定
3. 「When to Use」セクションを必ず含める
4. 関連スキルへのリンクを追加
5. このREADMEに追加
