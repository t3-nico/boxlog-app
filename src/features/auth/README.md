# auth - 認証機能

BoxLogアプリケーションの認証・セキュリティ機能を提供します。

## 📋 概要

ローカルストレージベースの認証システムを実装。将来的にSupabase認証への移行を想定した設計となっています。

## 🏗️ ディレクトリ構成

```
src/features/auth/
├── components/          # 認証関連UIコンポーネント
│   ├── AuthForm.tsx           # 統合認証フォーム
│   ├── AuthGuard.tsx          # ルート保護コンポーネント
│   ├── AuthLayout.tsx         # 認証画面レイアウト
│   ├── LoginForm.tsx          # ログインフォーム
│   ├── SignupForm.tsx         # サインアップフォーム
│   ├── PasswordResetForm.tsx  # パスワードリセットフォーム
│   ├── ProtectedRoute.tsx     # 保護ルートラッパー
│   └── LoginFormDisabled.tsx  # 無効化ログインフォーム（未使用）
├── contexts/            # React Context
│   └── AuthContext.tsx        # 認証状態管理Context
├── hooks/               # カスタムフック
│   ├── useAuth.ts             # 認証機能フック
│   ├── useAuth.test.ts        # useAuthテスト
│   └── useAuthForm.ts         # 認証フォームフック（未使用）
├── lib/                 # ユーティリティ・設定
│   └── auth-config.ts         # 認証設定・バリデーション
├── index.ts             # エクスポート定義
└── README.md            # このファイル
```

## 🎯 主要機能

### 1. 認証フロー

#### ローカルストレージモード（現在）
```typescript
// デフォルトユーザー自動作成
const defaultUser = {
  id: `local-user-${Date.now()}`,
  email: 'user@localhost'
}
localStorage.setItem('boxlog-user', JSON.stringify(defaultUser))
```

#### 将来のSupabase統合（予定）
- メール/パスワード認証
- OAuth認証（Google, Apple）
- セッション管理
- パスワードリセット

### 2. ルート保護

#### AuthGuard コンポーネント
```tsx
import { AuthGuard } from '@/features/auth'

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  )
}
```

**機能:**
- 認証状態チェック
- 未認証時の自動リダイレクト
- ローディング状態表示
- 開発環境での認証スキップ（`SKIP_AUTH_IN_DEV=true`）

### 3. 認証Context

#### AuthProvider
```tsx
import { AuthProvider } from '@/features/auth'

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  )
}
```

#### useAuthContext フック
```tsx
import { useAuthContext } from '@/features/auth'

function Component() {
  const {
    user,           // 現在のユーザー
    session,        // セッション情報
    loading,        // ローディング状態
    error,          // エラーメッセージ
    signIn,         // ログイン
    signUp,         // サインアップ
    signOut,        // ログアウト
    resetPassword,  // パスワードリセット
    updatePassword, // パスワード更新
    clearError      // エラークリア
  } = useAuthContext()

  // ...
}
```

## 🔒 セキュリティ設定

### パスワードポリシー
[auth-config.ts](./lib/auth-config.ts:4-10) で定義：

```typescript
PASSWORD: {
  MIN_LENGTH: 8,                  // 最小8文字
  REQUIRE_UPPERCASE: true,        // 大文字必須
  REQUIRE_LOWERCASE: true,        // 小文字必須
  REQUIRE_NUMBERS: true,          // 数字必須
  REQUIRE_SPECIAL_CHARS: false,   // 特殊文字不要
}
```

### セッション設定
```typescript
SESSION: {
  TIMEOUT: 3600,              // 1時間（秒）
  REFRESH_THRESHOLD: 300,     // 有効期限5分前にリフレッシュ
}
```

### レート制限
```typescript
RATE_LIMIT: {
  SIGN_UP: 5,           // サインアップ: 1時間に5回
  SIGN_IN: 10,          // ログイン: 1時間に10回
  PASSWORD_RESET: 3,    // パスワードリセット: 1時間に3回
}
```

## 🛠️ バリデーション関数

### パスワード検証
```typescript
import { validatePassword } from '@/features/auth'

const result = validatePassword('MyPass123')
// {
//   isValid: true,
//   errors: []
// }
```

### メールアドレス検証
```typescript
import { validateEmail } from '@/features/auth'

validateEmail('user@example.com') // true
validateEmail('invalid-email')     // false
```

### セッション有効期限チェック
```typescript
import { isSessionExpiringSoon } from '@/features/auth'

const expiresAt = Math.floor(Date.now() / 1000) + 200 // 200秒後
isSessionExpiringSoon(expiresAt) // true (5分以内)
```

## 📦 エクスポート

### コンポーネント
```typescript
export { AuthForm } from './components/AuthForm'
export { AuthGuard } from './components/AuthGuard'
export { AuthLayout } from './components/AuthLayout'
export { LoginForm } from './components/LoginForm'
export { PasswordResetForm } from './components/PasswordResetForm'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { SignupForm } from './components/SignupForm'
```

### Context & Hooks
```typescript
export { AuthProvider, useAuthContext } from './contexts/AuthContext'
export { useAuth } from './hooks/useAuth'
```

### 設定
```typescript
export { AUTH_CONFIG as authConfig } from './lib/auth-config'
```

## 🚨 エラーハンドリング

### エラーメッセージ
[auth-config.ts](./lib/auth-config.ts:34-42) で日本語エラーメッセージを定義：

```typescript
ERROR_MESSAGES: {
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  EMAIL_NOT_CONFIRMED: 'メールアドレスの確認が必要です',
  USER_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
  WEAK_PASSWORD: 'パスワードが弱すぎます',
  TOO_MANY_REQUESTS: 'リクエストが多すぎます。しばらく待ってから再試行してください',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
}
```

### エラー処理例
```tsx
const { error, clearError } = useAuthContext()

useEffect(() => {
  if (error) {
    toast.error(error)
    clearError()
  }
}, [error, clearError])
```

## 🧪 テスト

### useAuth フック
[useAuth.test.ts](./hooks/useAuth.test.ts) でテストを実装：

```bash
npm run test -- src/features/auth
```

## 🔄 開発モード

### 認証スキップ
開発時に認証をスキップ可能：

```bash
# .env.local
SKIP_AUTH_IN_DEV=true
```

[AuthGuard.tsx](./components/AuthGuard.tsx:19) で制御。

## 📚 関連ドキュメント

### プロジェクト内
- [セキュリティヘッダー設定](/docs/setup/SECURITY_HEADERS.md)
- [API検証ガイド](/docs/API_VALIDATION_GUIDE.md)
- [エラーパターンガイド](/docs/ERROR_PATTERNS_GUIDE.md)

### 外部
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 🚧 既知の制限事項

### ローカルストレージモード
- 実際の認証は行われない（スタブ実装）
- セキュリティ機能は模擬的
- OAuth未実装

### 型エラー
- [AuthContext.tsx](./contexts/AuthContext.tsx:1) に3件の型エラー（Issue #389で対応予定）

## 🔮 今後の改善

1. **Supabase統合**
   - メール/パ���ワード認証実装
   - OAuth（Google, Apple）実装
   - セッション管理強化

2. **セキュリティ強化**
   - CSRF保護
   - 多要素認証（MFA）
   - デバイストークン管理

3. **UX改善**
   - ソーシャルログイン
   - パスワードレス認証
   - Remember Me機能

4. **テストカバレッジ**
   - コンポーネントテスト追加
   - E2Eテスト（Playwright）
   - セキュリティテスト

## 📞 サポート

問題や質問がある場合：
- Issue作成: GitHub Issues
- ラベル: `feature:auth`, `P0-urgent`
- 関連Issue: [#389](https://github.com/t3-nico/boxlog-app/issues/389)（型エラー）

---

**最終更新**: 2025-10-02
**メンテナー**: BoxLog Development Team
**優先度**: 🔴 緊急（セキュリティ関連）