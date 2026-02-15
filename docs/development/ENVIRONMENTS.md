# 環境構成ガイド

Dayoptは3環境構成（Local / Staging / Production）で運用されています。

## 環境一覧

| 環境           | Supabase Project  | Vercel環境  | URL                       |
| -------------- | ----------------- | ----------- | ------------------------- |
| **Local**      | ローカル          | npm run dev | localhost:3000            |
| **Staging**    | dayopt-staging    | Preview     | \*.vercel.app（main以外） |
| **Production** | t3-nico's Project | Production  | 本番ドメイン              |

## Supabaseプロジェクト詳細

| プロジェクト      | Reference ID           | リージョン      | 用途         |
| ----------------- | ---------------------- | --------------- | ------------ |
| ローカル          | -                      | localhost:54321 | 開発         |
| dayopt-staging    | `yvglwblxrnrenfifsnje` | Tokyo           | ステージング |
| t3-nico's Project | `qloztwfbrbqtjijxicnd` | Tokyo           | 本番         |

## 重要な仕様

### DBの分離

- 各環境のデータベースは**完全に独立**
- 本番データはステージングに存在しない
- テストデータは自由に作成・削除可能

### 認証（Auth）の分離

- 各環境のユーザーアカウントは**共有されない**
- ステージングでサインアップ → ステージングのみログイン可能
- 本番アカウントでステージングにはログインできない

### Vercel環境変数

```
Production  → 本番Supabase
Preview     → ステージングSupabase（全Previewブランチ共通）
Development → ローカルSupabase
```

## マイグレーション適用手順

マイグレーションは各環境に**個別に適用**が必要です。

### 1. ローカルに適用

```bash
supabase db reset
# または
supabase migration up
```

### 2. ステージングに適用

```bash
supabase link --project-ref yvglwblxrnrenfifsnje
supabase db push
```

### 3. 本番に適用

```bash
supabase link --project-ref qloztwfbrbqtjijxicnd
supabase db push
```

### リンク状態の確認

```bash
supabase projects list
# LINKED列に●があるプロジェクトが現在リンク中
```

## 実機テスト手順

1. ブランチをプッシュ

   ```bash
   git push origin feature/xxx
   ```

2. Vercelが自動でPreviewデプロイ

3. Preview URLにモバイルでアクセス
   - 固定URL: `dayopt-git-{branch}-t3-nicos-projects.vercel.app`

4. ステージングでサインアップしてテスト

## トラブルシューティング

### ステージングにログインできない

→ ステージング環境で新規サインアップが必要（本番アカウントは使えない）

### マイグレーションが反映されない

→ 対象環境にリンクしてから `supabase db push` を実行

### Previewデプロイがエラー

→ Vercelダッシュボードでビルドログを確認
