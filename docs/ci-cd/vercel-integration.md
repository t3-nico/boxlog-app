# Vercel統合ガイド - 自動デプロイの仕組み

GitHub ActionsとVercelの統合について、仕組みと設定方法を詳しく解説します。

## 🔄 動作フロー

### 通常のPush/PR（dev, feature ブランチ）
```
1. コードプッシュ
   ↓
2. GitHub Actions起動
   ↓
3. lint → typecheck → test → build
   ↓
4. 結果をGitHubに報告（緑のチェック）
```

### mainブランチへのプッシュ
```
1. mainブランチにマージ
   ↓
2. GitHub Actions起動
   ↓
3. lint → typecheck → test → build
   ↓
4. ✅ 全て成功した場合のみ
   ↓
5. Vercel API経由で本番デプロイ
   ↓
6. 新しいプロダクションURLが利用可能
```

---

## 🏗️ Vercel側の準備

### 1. プロジェクト作成・連携

#### 初回セットアップ（未実施の場合）
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. **Add New Project** をクリック
3. **Import Git Repository** を選択
4. GitHubリポジトリを選択
5. プロジェクト設定：
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

#### 既存プロジェクトの場合
- Vercelダッシュボードでプロジェクトが正常に表示されるか確認
- 最新デプロイが成功しているか確認

### 2. Environment Variables設定

必要に応じてVercel側で環境変数を設定：

1. Vercelプロジェクト → **Settings** → **Environment Variables**
2. プロダクション用の環境変数を追加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

---

## 🔧 自動デプロイの仕組み

### GitHub Actions → Vercel API

我々の設定では、`amondnet/vercel-action@v25` を使用：

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    vercel-args: '--prod'
```

### 実行内容
1. **認証**: VERCEL_TOKENでAPI認証
2. **プロジェクト特定**: ORG_ID + PROJECT_IDで対象プロジェクト特定
3. **デプロイ実行**: `--prod` フラグで本番環境にデプロイ
4. **結果通知**: GitHub ActionsにデプロイURLを返却

---

## 📊 Vercelダッシュボードでの確認

### デプロイ履歴
1. Vercelプロジェクトページを開く
2. **Deployments** タブで以下を確認：
   ```
   🟢 Production (GitHub Actions deploy)
   📅 2025-01-18 11:45:32 UTC
   🌐 https://boxlog-app.vercel.app
   ```

### Functions ログ
1. **Functions** タブでAPI Routesの実行状況確認
2. エラーが発生した場合のデバッグ情報

### Analytics
1. **Analytics** タブでアクセス状況確認
2. パフォーマンス指標の監視

---

## 🔗 GitHubとの連携レベル

### レベル1: GitHub Actions経由デプロイ（現在の設定）
- **メリット**: CI/CD完全制御、条件付きデプロイ
- **デプロイタイミング**: mainブランチ + CI成功時のみ
- **設定**: GitHub Secrets必要

### レベル2: Vercel GitHub App連携（任意）
- **メリット**: PR毎のプレビューデプロイ
- **デプロイタイミング**: 全プッシュ
- **設定**: Vercel GitHub App インストール

#### GitHub App追加手順（任意）
1. Vercelプロジェクト → **Settings** → **Git**
2. **Connect Git Repository** → **GitHub App**
3. リポジトリ選択してインストール

#### 効果
- PR作成時に自動プレビューデプロイ
- PR画面にVercelプレビューリンク表示
- コメント機能で直接フィードバック可能

---

## ⚠️ 注意事項

### 本番デプロイの制限
- mainブランチへのプッシュでのみ実行
- CI/CDが全て成功した場合のみ実行
- 手動デプロイは別途Vercelダッシュボードから可能

### コスト管理
- Vercel Hobby Plan: 100GB bandwidth/month
- 大量デプロイ時は使用量を監視
- 不要なデプロイを避けるため、draft PRは避ける

### セキュリティ
- VERCEL_TOKENは権限が強いため、定期的な更新推奨
- Public リポジトリでは Secrets の取り扱い注意

---

## 🚀 デプロイ後の確認項目

### 1. アプリケーション動作確認
- [ ] ページが正常に表示される
- [ ] 認証機能が動作する
- [ ] API Routes が正常に応答する
- [ ] データベース接続が正常

### 2. パフォーマンス確認
- [ ] ページロード速度
- [ ] Core Web Vitals
- [ ] Function実行時間

### 3. 監視設定
- [ ] Vercel Analytics有効化
- [ ] エラー監視設定
- [ ] アラート設定（必要に応じて）

---

## 🔄 ロールバック手順

### 問題が発生した場合
1. Vercelダッシュボード → **Deployments**
2. 前回の正常なデプロイを選択
3. **Promote to Production** をクリック
4. 即座に前回バージョンに復旧

### GitHub側での対応
1. 問題のあるコミットをrevert
2. 修正版を新しいPRで提出
3. CI/CD通過後に再デプロイ

---

**最終更新**: 2025-01-18  
**関連ドキュメント**: `docs/ci-cd/github-setup.md`