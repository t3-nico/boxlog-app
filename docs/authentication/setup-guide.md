# 認証システム セットアップガイド

BoxLogアプリケーションの認証システムの設定と使用方法について説明します。

## 📋 実装済み機能

### ✅ 基本認証機能
- メール/パスワードによる新規登録
- メール/パスワードによるログイン
- セッション管理（自動）
- 認証ガード（未認証時の自動リダイレクト）
- OAuth認証対応（Google/Apple）※設定次第

### ✅ Supabase統合
- Supabaseのauth.usersテーブルとの連携
- リアルタイム認証状態監視
- 型安全なAuthContext実装

## 🔧 開発環境での設定

### 1. 環境変数
`.env.local` に以下が設定済み：
```
NEXT_PUBLIC_SUPABASE_URL=https://pjzmaqyxdskbifewiats.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase設定（開発用）

**Authentication** → **Settings** で：
- ✅ **Enable Email provider**: ON
- ❌ **Confirm email**: OFF（開発効率のため）
- ✅ **Secure email change**: ON
- ✅ **Secure password change**: ON
- ✅ **Prevent use of leaked passwords**: ON
- ✅ **Minimum password length**: 6文字

### 3. 開発中のメール確認

新規ユーザー登録後、メール未確認でログインエラーが出る場合：

#### SQL Editorで手動確認
```sql
-- 特定ユーザーの確認
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'your-email@example.com';

-- または全未確認ユーザーを一括確認
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
```

#### 確認方法
1. **Authentication** → **Users** で対象ユーザーを確認
2. `Confirmed at` が `-` から時刻に変更されていればOK

## 🚀 本番環境での設定

### 1. メール確認を有効化
**Authentication** → **Settings** で：
- ✅ **Confirm email**: ON に変更

### 2. メール設定の確認
- SMTP設定
- カスタムメールテンプレート（必要に応じて）
- リダイレクトURL設定

### 3. OAuth設定（必要に応じて）
Google/Apple認証を使用する場合：
- 各プロバイダーでのアプリ登録
- リダイレクトURL設定
- クライアントID/シークレット設定

## 🏗️ アーキテクチャ

### ファイル構成
```
src/
├── contexts/
│   └── AuthContext.tsx          # 認証コンテキスト（Supabase統合）
├── components/
│   ├── auth-guard.tsx           # 認証ガードコンポーネント
│   └── login-form.tsx           # ログインフォーム
├── app/
│   ├── (auth)/                  # 認証関連ページ
│   │   └── auth/
│   │       ├── login/page.tsx   # ログインページ
│   │       └── signup/page.tsx  # サインアップページ
│   ├── (app)/                   # 認証が必要なページ
│   │   └── layout.tsx           # AuthGuardを含む
│   └── auth/
│       └── callback/route.ts    # OAuth認証コールバック
└── lib/
    └── supabase/
        ├── client.ts            # クライアントサイドSupabaseクライアント
        └── server.ts            # サーバーサイドSupabaseクライアント
```

### 認証フロー
1. 未認証ユーザーが保護されたページにアクセス
2. `AuthGuard`が認証状態をチェック
3. 未認証の場合 → `/auth/login` にリダイレクト
4. ログイン成功 → 元のページまたは `/calendar` にリダイレクト

## 🧪 テスト方法

### 1. ローカル開発での確認
```bash
npm run dev
```

### 2. テストフロー
1. `http://localhost:3000` にアクセス
2. 自動的に `/auth/login` にリダイレクト
3. 新規ユーザーの場合：
   - `/auth/signup` でアカウント作成
   - メール確認が必要な場合は上記SQL実行
4. ログイン試行
5. 成功時は `/calendar` にリダイレクト

### 3. Supabase Dashboardでの確認
- **Authentication** → **Users** でユーザー一覧確認
- `Last signed in` が更新されていることを確認

## 🚨 トラブルシューティング

### "Email not confirmed" エラー
**原因**: メール確認が完了していない

**解決方法**:
1. 開発環境: SQL Editorで手動確認（上記参照）
2. 本番環境: 確認メールのリンクをクリック

### セッションが維持されない
**原因**: Supabaseクライアントの設定問題

**確認事項**:
- 環境変数が正しく設定されているか
- `createClient()`が正しく呼ばれているか

### リダイレクトループ
**原因**: AuthGuardとルーティングの競合

**確認事項**:
- `(auth)`ディレクトリがAuthGuardの対象外になっているか
- ログインページのパスが正しいか（`/auth/login`）

## 🔄 今後の拡張予定

- [ ] ログアウト機能のUI実装
- [ ] ユーザープロフィール管理
- [ ] パスワード変更機能
- [ ] OAuth認証の本格実装
- [ ] メール確認システムの改善
- [ ] Role-based Access Control (RBAC)

---

*最終更新: 2025-01-23*
*実装者: Claude Code & takayasu1121*