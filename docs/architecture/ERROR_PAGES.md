# エラーページシステム

**最終更新**: 2025-10-14
**関連Issue**: [#543](https://github.com/t3-nico/boxlog-app/issues/543)

## 📋 概要

BoxLogアプリケーションのエラーページシステム。shadcn-dashboard-landing-templateのデザインを参考に、統一されたUI/UXでエラー状況をユーザーに伝えます。

## 🎯 目的

- **統一されたUX**: すべてのエラーページで一貫したデザイン
- **多言語対応**: i18nによる日本語/英語の完全サポート
- **自動表示**: Next.jsの機能を活用した自動エラーハンドリング
- **アクセシビリティ**: セマンティックHTML、適切なARIA属性
- **CLAUDE.md準拠**: 8pxグリッド、セマンティックトークン使用

---

## 📁 ファイル構造

```
/src/app/
├── not-found.tsx                    # 404エラー（自動）
├── error.tsx                        # 500エラー（自動）
└── error/
    ├── 401/page.tsx                 # 認証エラー
    ├── 403/page.tsx                 # 権限エラー
    ├── 500/page.tsx                 # サーバーエラー
    └── maintenance/page.tsx         # メンテナンス

/src/features/i18n/lib/dictionaries/
├── ja.json                          # errors セクション
└── en.json                          # errors セクション

/src/middleware.ts                   # 自動リダイレクト処理
```

---

## 🏗️ エラーページ一覧

### 1. 自動表示されるエラーページ

#### not-found.tsx (404)

**パス**: `/src/app/not-found.tsx`
**トリガー**: 存在しないルートへのアクセス

```tsx
// Next.jsが自動的に表示
// ユーザーが /non-existent-page にアクセス → 404ページ表示
```

**特徴**:

- Next.jsの規約に従い、ルートに配置
- `useRouter()` で "/" へのナビゲーション
- i18n完全対応 (`t('errors.404.*')`)

#### error.tsx (500)

**パス**: `/src/app/error.tsx`
**トリガー**: ランタイムエラー

```tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  // 開発モードでエラーメッセージ表示
  // reset()関数で再試行可能
}
```

**特徴**:

- Error Boundaryとして機能
- `reset()`関数で再試行
- 開発モードではエラー詳細表示
- Sentryへのエラー送信ポイント

### 2. 手動ルーティング用エラーページ

#### 401 (Unauthorized)

**パス**: `/src/app/error/401/page.tsx`
**用途**: 認証が必要なページへの未認証アクセス

```tsx
// middleware.tsで自動リダイレクト
if (!user && isProtectedPath) {
  return NextResponse.redirect(new URL('/error/401', request.url))
}
```

#### 403 (Forbidden)

**パス**: `/src/app/error/403/page.tsx`
**用途**: 権限不足によるアクセス拒否

```tsx
// 権限チェック後、手動リダイレクト
if (!hasPermission) {
  router.push('/error/403')
}
```

#### 500 (Internal Server Error)

**パス**: `/src/app/error/500/page.tsx`
**用途**: 手動での500エラー表示

**注意**: ランタイムエラーは自動的に `/app/error.tsx` が処理します。この500ページは意図的にサーバーエラーを表示したい場合に使用します。

#### maintenance (503)

**パス**: `/src/app/error/maintenance/page.tsx`
**用途**: メンテナンスモード

```bash
# .envファイルで有効化
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

```tsx
// middleware.tsで全アクセスをリダイレクト
const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
if (isMaintenanceMode && !isMaintenancePage) {
  return NextResponse.redirect(new URL('/error/maintenance', request.url))
}
```

---

## 🎨 デザイン仕様

### 統一レイアウト

すべてのエラーページは以下の構造を採用：

```tsx
<div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16">
  {/* プレースホルダー画像 */}
  <Image
    src="https://ui.shadcn.com/placeholder.svg"
    alt="placeholder image"
    width={960}
    height={540}
    className="w-240 aspect-video rounded-xl object-cover dark:invert"
  />

  {/* エラー情報 */}
  <div className="text-center">
    <h1 className="mb-4 text-3xl font-bold">{statusCode}</h1>
    <h2 className="mb-4 text-2xl font-semibold">{heading}</h2>
    <p className="text-muted-foreground">{description}</p>

    {/* アクションボタン */}
    <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
      <Button onClick={primaryAction}>{primaryLabel}</Button>
      <Button variant="outline" onClick={secondaryAction}>
        {secondaryLabel}
      </Button>
    </div>
  </div>
</div>
```

### CLAUDE.md準拠チェックリスト

- [x] **8pxグリッドシステム**
  - `gap-8` (32px), `gap-4` (16px)
  - `p-8` (32px), `p-16` (64px)
  - `mb-4` (16px), `mt-6` (24px)

- [x] **セマンティックトークン**
  - `text-muted-foreground`
  - `bg-muted`, `border-border`
  - `text-destructive` (エラーメッセージ用)

- [x] **レスポンシブデザイン**
  - `md:gap-12`, `md:p-16`, `md:mt-8`
  - モバイル/タブレット/デスクトップ対応

- [x] **next/imageコンポーネント**
  - `<Image />` 必須使用
  - `width`, `height` 明示指定

- [x] **ダークモード対応**
  - `dark:invert` でプレースホルダー反転

### ボタン仕様

**プライマリーアクション**:

```tsx
<Button className="cursor-pointer" onClick={() => router.push('/')}>
  {t('errors.common.goHome')}
</Button>
```

**セカンダリーアクション**:

```tsx
<Button
  variant="outline"
  className="flex cursor-pointer items-center gap-1"
  onClick={() => (window.location.href = 'mailto:support@boxlog.com')}
>
  {t('errors.common.contactUs')}
</Button>
```

**重要**: mailtoリンクは `window.location.href` を使用（`router.push()`は使用不可）

---

## 🌐 i18n実装

### 翻訳キー構造

```json
{
  "errors": {
    "common": {
      "contactUs": "お問い合わせ",
      "goHome": "ホームに戻る",
      "reload": "再読み込み"
    },
    "404": {
      "title": "404",
      "heading": "ページが見つかりません",
      "description": "お探しのページは存在しないか、移動した可能性があります。",
      "action": "ホームに戻る"
    },
    "401": {
      "title": "401",
      "heading": "認証が必要です",
      "description": "このページにアクセスするには、ログインが必要です。",
      "action": "ログインページへ",
      "secondaryAction": "ホームに戻る"
    },
    "403": {
      "title": "403",
      "heading": "アクセスが禁止されています",
      "description": "このページにアクセスする権限がありません。",
      "action": "ホームに戻る"
    },
    "500": {
      "title": "500",
      "heading": "サーバーエラー",
      "description": "予期しないエラーが発生しました。しばらくしてから再度お試しください。",
      "secondaryAction": "ホームに戻る"
    },
    "maintenance": {
      "heading": "メンテナンス中",
      "description": "現在メンテナンス中です。しばらくしてから再度アクセスしてください。"
    }
  }
}
```

### 使用例

```tsx
'use client'

import { useI18n } from '@/features/i18n/lib/hooks'

export default function ErrorPage() {
  const { t } = useI18n()

  return (
    <div>
      <h1>{t('errors.404.title')}</h1>
      <h2>{t('errors.404.heading')}</h2>
      <p>{t('errors.404.description')}</p>

      {/* 共通ボタンラベル */}
      <Button>{t('errors.common.goHome')}</Button>
      <Button>{t('errors.common.contactUs')}</Button>
      <Button>{t('errors.common.reload')}</Button>
    </div>
  )
}
```

---

## 🔧 Middleware統合

### メンテナンスモード

```tsx
// src/middleware.ts
async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // メンテナンスモードチェック
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  const isMaintenancePage = pathname.includes('/error/maintenance')

  if (isMaintenanceMode && !isMaintenancePage) {
    console.log('[Middleware] Maintenance mode active, redirecting to maintenance page')
    return NextResponse.redirect(new URL('/error/maintenance', request.url))
  }

  // ... 他の処理
}
```

### 認証エラー (401)

```tsx
// src/middleware.ts
async function middleware(request: NextRequest) {
  const user = await getUser(request)
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!user && isProtectedPath) {
    console.log('[Middleware] Redirecting to 401:', request.nextUrl.pathname)
    return NextResponse.redirect(new URL('/error/401', request.url))
  }

  // ... 他の処理
}
```

---

## 🚀 使用方法

### 1. 404エラーの表示

Next.jsが自動的に処理します。特別な実装は不要です。

```tsx
// 存在しないURLにアクセス → 自動的に not-found.tsx が表示される
http://localhost:3000/non-existent-page
```

### 2. ランタイムエラーの表示

```tsx
// コンポーネント内でエラーが発生 → 自動的に error.tsx が表示される
export default function MyComponent() {
  throw new Error('Something went wrong!')
}
```

### 3. 手動リダイレクト

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const router = useRouter()
  const hasPermission = false

  if (!hasPermission) {
    router.push('/error/403')
    return null
  }

  return <div>Protected Content</div>
}
```

### 4. メンテナンスモードの有効化

```bash
# .env.local に追加
NEXT_PUBLIC_MAINTENANCE_MODE=true

# 開発サーバー再起動
npm run dev
```

全ページアクセス時にメンテナンスページが表示されます。

---

## 🧪 テスト方法

### 404エラー

```bash
# ブラウザで存在しないURLにアクセス
http://localhost:3000/non-existent-page
```

### 401エラー

```bash
# ログアウト状態で保護されたページにアクセス
http://localhost:3000/dashboard
```

### 403エラー

```bash
# 権限不足のユーザーで管理画面にアクセス
http://localhost:3000/admin
```

### 500エラー

```tsx
// 意図的にエラーをスロー
export default function TestErrorPage() {
  throw new Error('Test error')
}
```

### メンテナンスモード

```bash
# .env.localに追加
NEXT_PUBLIC_MAINTENANCE_MODE=true

# 任意のページにアクセス
http://localhost:3000/
```

### i18n確認

```bash
# 日本語
http://localhost:3000/ja/error/401

# 英語
http://localhost:3000/en/error/401
```

---

## 🔍 トラブルシューティング

### Q: エラーページが表示されない

**A**: Next.jsキャッシュをクリアしてください。

```bash
rm -rf .next
npm run dev
```

### Q: mailtoリンクが動作しない

**A**: `router.push('mailto:...')` ではなく `window.location.href = 'mailto:...'` を使用してください。

```tsx
// ❌ 動作しない
<Button onClick={() => router.push('mailto:support@boxlog.com')}>

// ✅ 正しい
<Button onClick={() => (window.location.href = 'mailto:support@boxlog.com')}>
```

### Q: 翻訳が表示されず英語になる

**A**: 翻訳キーが `ja.json` と `en.json` の両方に存在するか確認してください。

```bash
# 翻訳キーの存在確認
grep -r "errors.404.title" src/features/i18n/lib/dictionaries/
```

### Q: メンテナンスモードが解除されない

**A**: 環境変数を削除し、開発サーバーを再起動してください。

```bash
# .env.localから以下を削除
# NEXT_PUBLIC_MAINTENANCE_MODE=true

# 開発サーバー再起動
npm run dev
```

---

## 🎯 ベストプラクティス

### ✅ DO

- エラーページは統一されたデザインを維持する
- すべてのテキストをi18n対応にする
- CLAUDE.md準拠（8pxグリッド、セマンティックトークン）
- next/imageコンポーネントを使用する
- ダークモード対応を必ず実装する

### ❌ DON'T

- ハードコードされたテキストを使用しない
- `router.push()` でmailtoリンクを開かない
- カスタムカラー値を使用しない
- 独自のエラーページデザインを作成しない
- エラーページ内でさらにエラーを発生させない

---

## 📚 関連ドキュメント

- [エラーハンドリングシステム](../architecture/ERROR_HANDLING.md)
- [CLAUDE.md開発指針](../../CLAUDE.md)
- [デザインシステム](../design-system/THEME_MIGRATION.md)

---

## 🔮 将来の拡張

### エラーページバリエーション

現在はシンプルなエラーページのみですが、以下の拡張が可能です：

- **アニメーション**: エラー画像にアニメーション追加
- **カスタム画像**: エラーコードごとに異なる画像
- **詳細ログ**: 管理者向けの詳細エラーログ表示
- **自動リトライ**: ネットワークエラー時の自動再試行
- **ヘルプリンク**: エラーコードごとのヘルプ記事リンク

### Sentryとの統合

```tsx
// error.tsx
useEffect(() => {
  // Sentryにエラー送信
  Sentry.captureException(error, {
    tags: {
      errorPage: '500',
      digest: error.digest,
    },
  })
}, [error])
```

---

**メンテナー**: BoxLog Development Team
**最終レビュー**: 2025-10-14

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
