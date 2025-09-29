# 🚀 Vercel環境でのSentry設定ガイド

## 📋 前提条件
- [x] GitHubリポジトリ作成済み (`t3-nico/boxlog-app`)
- [x] Vercelアカウント連携済み
- [x] Sentryアカウント・プロジェクト作成済み

## 🔧 Vercel環境変数の設定

### 1. Vercelダッシュボードにアクセス
1. https://vercel.com/dashboard にログイン
2. `boxlog-app` プロジェクトを選択
3. **Settings** → **Environment Variables** タブ

### 2. Sentry環境変数を追加

以下の環境変数をすべて追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://your-dsn@sentry.io/project-id` | Production, Preview, Development |
| `SENTRY_ORG` | `your-organization-slug` | Production, Preview, Development |
| `SENTRY_PROJECT` | `boxlog-app` | Production, Preview, Development |
| `SENTRY_AUTH_TOKEN` | `your-auth-token` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Production, Preview, Development |

### 3. 追加の本番環境設定

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 本番環境フラグ |
| `VERCEL_URL` | (自動設定) | Vercel提供のURL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | アプリケーションURL |

## 🔄 自動デプロイの確認

### デプロイトリガー
- `dev` ブランチへのプッシュ → プロダクションデプロイ
- プルリクエスト → プレビューデプロイ
- コミット → 自動ビルド・テスト

### ビルドコマンド確認
```json
// vercel.json
{
  "buildCommand": "yarn build:fallback",
  "devCommand": "yarn dev:fallback",
  "installCommand": "yarn install",
  "framework": "nextjs"
}
```

## 🧪 デプロイ後の動作確認

### 1. 本番環境でのテスト
```bash
# デプロイ完了後
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/test-sentry
```

### 2. Sentryでの確認
1. https://sentry.io にログイン
2. `boxlog-app` プロジェクトを選択
3. **Issues** タブで本番エラーを確認
4. **Performance** タブでパフォーマンス確認

### 3. エラーテスト（本番環境）
1. `https://your-app.vercel.app/test-sentry` にアクセス
2. エラーテストボタンをクリック
3. Sentryダッシュボードでエラー確認

## 🎯 成功の確認ポイント

### ✅ Vercelダッシュボード
- [ ] プロジェクトが存在する
- [ ] GitHubリポジトリと連携されている
- [ ] 環境変数が正しく設定されている
- [ ] 最新のコミットがデプロイされている
- [ ] ビルドが成功している

### ✅ 本番アプリケーション
- [ ] アプリケーションが正常に表示される
- [ ] `/test-sentry` ページが動作する
- [ ] エラーテストが機能する

### ✅ Sentryダッシュボード
- [ ] 本番環境からのエラーが記録される
- [ ] パフォーマンスデータが収集される
- [ ] ソースマップが正常に動作する
- [ ] リアルタイムでエラーが表示される

## 🚨 トラブルシューティング

### ビルドエラーの場合
1. Vercel **Functions** タブでログ確認
2. 環境変数の値を再確認
3. `yarn build:fallback` をローカルで実行してテスト

### Sentryエラーが記録されない場合
1. `NEXT_PUBLIC_SENTRY_DSN` の値を確認
2. Sentryプロジェクトの設定を確認
3. ブラウザの開発者ツールでネットワークエラー確認

### パフォーマンス監視が動作しない場合
1. Sentryプロジェクトで **Performance** が有効か確認
2. `web-vitals` パッケージが正しくインストールされているか確認

## 🎉 完成時の状態

この設定完了で以下が実現します：

- **自動デプロイ**: GitHubプッシュ → Vercel自動デプロイ
- **エラー監視**: 本番環境のリアルタイムエラー捕捉
- **パフォーマンス監視**: Core Web Vitals・API応答時間の測定
- **ソースマップ**: 本番エラーの元コード表示
- **アラート**: 重要エラーの即座通知

**「技術がわからない自分でも、技術的な失敗をしない開発環境」**の完全版が稼働開始！🚀