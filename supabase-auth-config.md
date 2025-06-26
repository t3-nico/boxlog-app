# Supabase Authentication ベストプラクティス設定

## 1. 認証設定 (Authentication > Settings)

### 基本設定
- **Site URL**: `https://your-domain.vercel.app` (本番環境)
- **Redirect URLs**: 
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (開発環境)

### セキュリティ設定
- **Enable email confirmations**: ✅ 有効
- **Enable phone confirmations**: ❌ 無効（必要に応じて）
- **Enable manual linking**: ❌ 無効
- **Enable email change confirmations**: ✅ 有効

### パスワード設定
- **Minimum password length**: 8文字
- **Password strength**: Strong
- **Enable password history**: ✅ 有効（過去3回分）
- **Password expiration**: 90日

### セッション設定
- **Session timeout**: 3600秒（1時間）
- **Refresh token rotation**: ✅ 有効
- **Enable refresh token reuse detection**: ✅ 有効

## 2. メール設定 (Authentication > Email Templates)

### 確認メール
- **Subject**: "BoxLog - メールアドレスの確認"
- **Template**: カスタマイズしてブランドに合わせる

### パスワードリセット
- **Subject**: "BoxLog - パスワードリセット"
- **Template**: セキュリティを考慮した内容

### メール変更
- **Subject**: "BoxLog - メールアドレス変更の確認"

## 3. プロバイダー設定

### Email Provider
- **Enable sign up**: ✅ 有効
- **Enable sign in**: ✅ 有効
- **Enable password reset**: ✅ 有効

### ソーシャルログイン（オプション）
- Google OAuth
- GitHub OAuth
- Discord OAuth

## 4. セキュリティ設定

### Rate Limiting
- **Sign up rate limit**: 5回/時間
- **Sign in rate limit**: 10回/時間
- **Password reset rate limit**: 3回/時間

### ブラックリスト
- 一般的なパスワードをブラックリストに追加
- 一時的なメールアドレスドメインをブロック

## 5. データベース設定

### RLS (Row Level Security) ポリシー
```sql
-- ユーザープロフィールテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみアクセス可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### トリガー設定
```sql
-- 新規ユーザー登録時にプロフィールを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 6. 環境変数設定

### .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vercel環境変数
- 本番環境用の環境変数をVercelダッシュボードで設定
- 開発環境と本番環境で異なる設定を使用

## 7. セキュリティチェックリスト

- [ ] HTTPS通信の強制
- [ ] CORS設定の適切な構成
- [ ] 環境変数の適切な管理
- [ ] ログの監視設定
- [ ] バックアップ設定
- [ ] 監査ログの有効化

## 8. 監視とアラート

### 監視項目
- 認証失敗回数
- 異常なアクセスパターン
- データベース接続数
- API使用量

### アラート設定
- 認証失敗の急増
- 異常な地理的アクセス
- データベースエラー 