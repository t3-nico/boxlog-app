# Vercel 自動デプロイ設定ガイド

## 📋 概要

GitHub ActionsからVercel手動デプロイを、**Vercel GitHubインテグレーション**による自動デプロイに移行します。

## 🎯 メリット

### 現在（GitHub Actions経由）

- ❌ ワークフロー実行時間が長い
- ❌ GitHub Actionsの実行時間を消費
- ❌ シークレット管理が複雑
- ❌ デプロイ失敗時の再試行が手動

### 移行後（Vercel自動デプロイ）

- ✅ GitHub Actionsの実行時間を節約
- ✅ Vercelが自動的にビルド・デプロイ
- ✅ プレビューデプロイ自動生成（PR毎）
- ✅ ロールバックが簡単
- ✅ デプロイ状況をGitHub PRで確認可能

## 🚀 設定手順

### Step 1: Vercel GitHubインテグレーション設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト選択: `boxlog-app`
3. **Settings** → **Git** タブ
4. **GitHub Integration** セクション:
   - ✅ Production Branch: `main`
   - ✅ Automatic Deployment: ON
   - ✅ Deploy Previews: ON (PRごとに自動生成)

### Step 2: ブランチ設定

```yaml
Production Branch: main
Development Branch: dev (optional)
```

- `main` へのpush → 本番デプロイ
- `dev` へのpush → プレビューデプロイ（optional）
- PR作成 → プレビューデプロイ自動生成

### Step 3: 環境変数設定

Vercel Dashboard → **Settings** → **Environment Variables**

#### Production環境

```env
NEXT_PUBLIC_SUPABASE_URL=<本番URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<本番KEY>
NEXT_PUBLIC_APP_URL=<本番URL>
```

#### Preview環境（optional）

```env
NEXT_PUBLIC_SUPABASE_URL=<開発URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<開発KEY>
NEXT_PUBLIC_APP_URL=<プレビューURL>
```

### Step 4: GitHub Actionsワークフロー更新

`deploy` ジョブは削除またはコメントアウト。Vercelが自動的にデプロイします。

### Step 5: 動作確認

1. `dev` ブランチにpush → Vercelがプレビューデプロイ
2. PR作成 (`dev` → `main`) → PRにプレビューURLが表示
3. PRマージ → 本番デプロイ自動実行

## 📊 main.yml の変更点

### Before（現在）

```yaml
deploy:
  name: 🚀 Deploy
  runs-on: ubuntu-latest
  needs: [quality-gate]
  steps:
    - name: 🚀 Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### After（Vercel自動デプロイ）

```yaml
# deploy ジョブは削除
# Vercel GitHubインテグレーションが自動的にデプロイ
```

## 🔧 トラブルシューティング

### デプロイが実行されない

- Vercel Dashboard で GitHub Integration が有効か確認
- Production Branch 設定を確認（`main` になっているか）

### 環境変数が反映されない

- Vercel Dashboard → Environment Variables で設定確認
- Production/Preview/Development の適用環境を確認

### ビルドエラー

- Vercel Dashboard → Deployments → ログ確認
- `npm run build` がローカルで成功するか確認

## 📚 参考資料

- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli)

## 🔗 関連Issue

- #388 - CI/CDフローの最適化（Phase 4）

---

**最終更新**: 2025-10-01
**担当**: Claude Code

---

**種類**: 📗 ハウツーガイド
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
