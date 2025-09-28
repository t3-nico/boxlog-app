# 🔗 Sentry アカウント紐づけガイド

## 📋 必要な情報の取得方法

### 1. DSN の取得

1. [Sentry.io](https://sentry.io) にログイン
2. 作成したプロジェクトを選択
3. **Settings** → **Client Keys (DSN)**
4. DSN をコピー（`https://xxx@sentry.io/xxx` の形式）

### 2. Organization と Project の確認

- **Organization Slug**: URLに表示される組織名（例: `my-org`）
- **Project Slug**: プロジェクト名（例: `boxlog-app`）

### 3. Auth Token の生成

1. **Settings** → **Auth Tokens**
2. **Create New Token**
3. **Scopes** を選択:
   - `project:releases` ✅
   - `project:write` ✅
   - `org:read` ✅
4. 生成されたトークンを記録

## 🔧 .env.local の設定例

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@sentry.io/1234567
SENTRY_ORG=my-organization
SENTRY_PROJECT=boxlog-app
SENTRY_AUTH_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🧪 動作確認手順

1. 設定完了後、開発サーバー起動:

   ```bash
   npm run dev
   ```

2. テストページにアクセス:

   ```
   http://localhost:3000/test-sentry
   ```

3. エラーテストを実行:
   - 「テスト1: 通常のエラー」ボタンをクリック
   - 「テスト2: 非同期エラー」ボタンをクリック
   - 「テスト3: ネットワークエラー」ボタンをクリック

4. Sentryダッシュボードで確認:
   - エラーが記録されているか
   - スタックトレースが表示されるか
   - パフォーマンスデータが収集されているか

## ✅ 確認ポイント

### エラー監視

- [ ] エラーイベントが Sentry に送信される
- [ ] スタックトレースが正確に表示される
- [ ] ユーザーコンテキストが記録される
- [ ] ブラウザ情報が記録される

### パフォーマンス監視

- [ ] ページロード時間が測定される
- [ ] Core Web Vitals が記録される
- [ ] API レスポンス時間が測定される

## 🚨 トラブルシューティング

### DSN が無効な場合

```
[Sentry] Cannot initialize SDK with the given DSN
```

→ DSN の形式と値を再確認

### Auth Token エラー

```
[Sentry] Unauthorized
```

→ Auth Token のスコープと有効性を確認

### SourceMap が表示されない場合

→ `.sentryclirc` ファイルの設定を確認
→ ビルド時にソースマップがアップロードされているか確認

## 🎯 成功時の確認項目

Sentryダッシュボードで以下が確認できれば設定完了：

1. **Issues** タブ: テストエラーが表示される
2. **Performance** タブ: ページロード・API呼び出しが記録される
3. **User Context**: ブラウザ・セッション情報が記録される
4. **Source Maps**: 元のTypeScriptコードが表示される

これで「技術的失敗をしない開発環境」の基盤完成です！🎉
