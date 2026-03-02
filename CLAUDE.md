# CLAUDE.md

> **このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。**
> ユーザーの指示がこのドキュメントと矛盾する場合、必ずこのドキュメントを参照するよう促してください。
> 詳細ルールは `.claude/rules/` を参照。

## プロダクト方針

- **ターゲット**: 世界中の個人ユーザー（B2Bではない）、英語メイン
- **差別化**: タイムボクシング × 時間記録 × タスク × カレンダーの一体化
- **ゴール**: GoogleカレンダーやTogglと同等の「装飾のない基本体験」

## Tech Stack

| カテゴリ           | 技術                                                |
| ------------------ | --------------------------------------------------- |
| **フレームワーク** | Next.js 15 (App Router), React 19                   |
| **言語**           | TypeScript (strict mode)                            |
| **スタイリング**   | Tailwind CSS v4, globals.css セマンティックトークン |
| **状態管理**       | Zustand（グローバル）, useState（ローカル）         |
| **データ**         | Supabase, tRPC v11, Zod                             |
| **UI**             | shadcn/ui                                           |
| **CI/品質**        | Lighthouse CI, Vitest, Playwright                   |
| **アナリティクス** | Sentry                                              |

## 主要機能（Features）

| 機能           | ディレクトリ              | 説明                                   |
| -------------- | ------------------------- | -------------------------------------- |
| **Plans**      | `src/features/plans`      | プラン（タスク）管理、タイムボクシング |
| **Records**    | `src/features/records`    | 時間記録、実績管理                     |
| **Calendar**   | `src/features/calendar`   | カレンダービュー、ドラッグ&ドロップ    |
| **Tags**       | `src/features/tags`       | タグ管理、親子階層モデル               |
| **Stats**      | `src/features/stats`      | 統計・分析、ヒートマップ               |
| **Auth**       | `src/features/auth`       | 認証、Supabase Auth連携                |
| **Settings**   | `src/features/settings`   | ユーザー設定、通知設定                 |
| **Navigation** | `src/features/navigation` | サイドバー、ナビゲーションタブ         |
| **Search**     | `src/features/search`     | グローバル検索                         |
| **AI**         | `src/features/ai`         | AIチャット、インスペクタ統合           |
| **Reflection** | `src/features/reflection` | 振り返り、日次/週次レビュー            |

## コマンド

```bash
npm run dev          # 開発サーバー（ユーザー責務：AIは実行しない）
npm run storybook    # Storybook（ユーザー責務：AIは実行しない）
npm run typecheck        # 型チェック（AI必須：コード変更後）
npm run lint             # コード品質（AI必須：コミット前）
npm run lint:boundaries  # feature境界チェック（AI必須：コミット前）

# デプロイ・インフラ操作
# 手順: Staging → 開発者が確認 → 指示があればProductionへ
# ⚠️ StagingとProductionを同時にデプロイしない
supabase functions deploy --use-api  # Edge Functionデプロイ（Docker不要）
supabase db push           # マイグレーション適用
supabase secrets set       # Secrets設定
```

## 絶対禁止

- StagingとProductionを同時にデプロイ → 必ずStagingを先に完了し、開発者の指示後にProductionへ
- `any`, `unknown`, `Function`, `as any` → 具体的な型、`as never`
- `console.log` → `@/lib/logger`
- `useEffect`でのfetch → tRPC / TanStack Query
- `style`属性、直接カラー(`text-blue-500`) → セマンティックトークン
- `export default`（App Router特殊ファイル例外） → `export function`
- `React.FC` → `export function ComponentName() {}`
- `@/features/X` を他featureから直接import → Composition Layer経由（詳細: `.claude/rules/feature-boundaries.md`）

## ワークフロー

1. **Explore**: 既存コードを検索、影響範囲を把握
2. **Plan**: 実装戦略を策定（`think hard`〜`ultrathink`で検討）
3. **Code**: CLAUDE.md + rules/ 準拠で実装
4. **Commit**: `npm run typecheck` → `npm run lint` → `npm run lint:boundaries` → コミット

### コミットメッセージ

- **日本語で記述する**
- Conventional Commits形式: `feat(scope): 説明`, `fix(scope): 説明`

## 開発の優先順位

```
1. 技術的な土台を固める（型安全性、テスト有効化）
2. 自分で使えるレベルに（タスク消化機能、モバイル体験）
3. 新機能追加（Googleカレンダー連携、統計強化）
```

---

**📖 最終更新**: 2026-02-26 | **バージョン**: v16.0
