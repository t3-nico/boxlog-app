# CLAUDE.md

## プロダクト方針

- **ターゲット**: 世界中の個人ユーザー（B2Bではない）
- **差別化**: タイムボクシング × 時間記録 × タスク × カレンダーの一体化
- **ゴール**: GoogleカレンダーやTogglと同等の「装飾のない基本体験」

## Tech Stack

Next.js 15 (App Router) / React 19 / TypeScript strict / Tailwind CSS v4 / Zustand / Supabase / tRPC v11 / Zod / shadcn/ui / Sentry

## コマンド

```bash
npm run dev          # 開発サーバー（AIは実行しない）
npm run storybook    # Storybook（AIは実行しない）
npm run typecheck    # 型チェック（AI必須：コード変更後）
npm run lint         # コード品質（AI必須：コミット前）
npm run lint:boundaries  # feature境界チェック（AI必須：コミット前）
```

## 絶対禁止

- `any` / `unknown` / `Function` / `as any` → 具体的な型、`as never`
- `console.log` → `@/lib/logger`
- `useEffect`でのfetch → tRPC / TanStack Query
- `style`属性 / 直接カラー(`text-blue-500`) → セマンティックトークン
- `export default`（App Router特殊ファイル例外） → named export
- `React.FC` → `export function ComponentName() {}`
- `@/features/X` を他featureから直接import → Composition Layer経由

## ワークフロー

1. **Explore**: 既存コードを検索、影響範囲を把握
2. **Plan**: 実装戦略を策定（`think hard`〜`ultrathink`で検討）
3. **Code**: CLAUDE.md + rules/ 準拠で実装
4. **Commit**: typecheck → lint → lint:boundaries → コミット

### コミットメッセージ

- **日本語で記述する**
- Conventional Commits形式: `feat(scope): 説明`, `fix(scope): 説明`

## デプロイ

- **IMPORTANT**: StagingとProductionを同時にデプロイしない
- Staging → 開発者が確認 → 指示後にProductionへ
- `supabase functions deploy --use-api`（Docker不要）
