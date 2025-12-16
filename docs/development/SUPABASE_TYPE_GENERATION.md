# Supabase 型自動生成ガイド

## 概要

Supabase CLIを使用して、データベーススキーマから自動的にTypeScript型定義を生成します。

## コマンド

### 本番環境から型生成（推奨）

```bash
npm run types:generate
```

- Supabase本番環境のスキーマから型を生成
- `src/types/supabase.ts`に出力
- プロジェクトID: `qloztwfbrbqtjijxicnd`

### ローカル環境から型生成

```bash
npm run types:generate:local
```

- ローカルのSupabaseインスタンスから型を生成
- `supabase start`が実行されている必要がある

## 使用タイミング

型生成は以下のタイミングで実行してください：

### 必須

- データベーススキーマを変更した後
- 新しいテーブルを追加した後
- カラムの型を変更した後

### 推奨

- 定期的（週1回程度）
- 本番環境のスキーマと同期を確認する

## 型生成のワークフロー

```bash
# 1. データベース変更をマイグレーションで適用
npm run migration:create add_new_table
# マイグレーションファイルを編集
supabase db push

# 2. 型を再生成
npm run types:generate

# 3. 型チェック
npm run typecheck

# 4. コミット
git add src/types/supabase.ts
git commit -m "chore(types): update Supabase types after schema change"
```

## 注意事項

### ⚠️ 手動編集の禁止

`src/types/supabase.ts`は自動生成ファイルです。直接編集しないでください。

### ✅ カスタム型の追加

カスタム型が必要な場合は別ファイルに定義：

```typescript
// src/types/custom.ts
import type { Database } from './supabase'

export type TaskWithUser = Database['public']['Tables']['tasks']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row']
}
```

## トラブルシューティング

### エラー: "project_id not found"

- `.env.local`に`NEXT_PUBLIC_SUPABASE_URL`が設定されているか確認
- Supabaseプロジェクトが存在するか確認

### エラー: "connection refused"

- ローカル環境の場合: `supabase start`を実行
- 本番環境の場合: ネットワーク接続を確認

### 生成された型がおかしい

- データベーススキーマを確認
- 最新のマイグレーションが適用されているか確認
- `supabase db reset`でローカル環境をリセット

## 参考

- [Supabase CLI Type Generation](https://supabase.com/docs/guides/cli/managing-environments#generate-types)
- [TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

---

**種類**: 📗 ハウツーガイド
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
