# Sentry 統合ガイド

BoxLogアプリケーションにおけるSentryの統合・設定・運用の完全ガイド。

## 📋 目次

- [概要](#概要)
- [セットアップ](#セットアップ)
  - [ローカル環境](#ローカル環境)
  - [Vercel環境](#vercel環境)
- [アーキテクチャ](#アーキテクチャ)
- [実装ガイド](#実装ガイド)
- [運用](#運用)
- [トラブルシューティング](#トラブルシューティング)
- [FAQ](#faq)

---

## 概要

### Sentryとは

Sentryはリアルタイムエラー追跡・パフォーマンス監視プラットフォームです。BoxLogでは以下の目的で使用しています：

- **エラー監視**: 本番環境でのリアルタイムエラー捕捉・通知
- **パフォーマンス監視**: Core Web Vitals・API応答時間の測定
- **デバッグ支援**: ソースマップによる元コードの表示
- **ユーザーコンテキスト**: エラー発生時のユーザー情報・環境情報の記録

### BoxLogでの活用

```typescript
// エラーパターン辞書との統合
import { reportToSentry } from '@/lib/sentry'
import { AppError } from '@/config/error-patterns'

try {
  await riskyOperation()
} catch (error) {
  const appError = new AppError('操作に失敗', 'SYSTEM_ERROR_500', { error })
  reportToSentry(appError) // 自動分類・構造化レポート
}
```

---

## セットアップ

### ローカル環境

#### 1. Sentryアカウント作成

1. [Sentry.io](https://sentry.io) にアクセス
2. アカウント作成・ログイン
3. 新規プロジェクト作成
   - Platform: **Next.js**
   - Project Name: **boxlog-app**

#### 2. 必要な情報の取得

**DSN の取得**
1. プロジェクトを選択
2. **Settings** → **Client Keys (DSN)**
3. DSN をコピー（`https://xxx@sentry.io/xxx` 形式）

**Organization と Project の確認**
- **Organization Slug**: URLに表示される組織名（例: `my-org`）
- **Project Slug**: プロジェクト名（例: `boxlog-app`）

**Auth Token の生成**
1. **Settings** → **Auth Tokens**
2. **Create New Token**
3. **Scopes** を選択:
   - `project:releases` ✅
   - `project:write` ✅
   - `org:read` ✅
4. 生成されたトークンを記録

#### 3. 環境変数設定

`.env.local` ファイルを作成：

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@sentry.io/1234567
SENTRY_ORG=my-organization
SENTRY_PROJECT=boxlog-app
SENTRY_AUTH_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### 4. 動作確認

```bash
# 開発サーバー起動
npm run smart:dev

# テストページにアクセス
# http://localhost:3000/test-sentry

# エラーテストボタンをクリックしてSentryダッシュボードで確認
```

**確認ポイント**:
- [ ] エラーイベントが Sentry に送信される
- [ ] スタックトレースが正確に表示される
- [ ] ユーザーコンテキストが記録される
- [ ] ブラウザ情報が記録される

---

### Vercel環境

#### 1. Vercelダッシュボードで環境変数設定

1. https://vercel.com/dashboard にログイン
2. `boxlog-app` プロジェクトを選択
3. **Settings** → **Environment Variables**

#### 2. Sentry環境変数を追加

すべての環境（Production, Preview, Development）に追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://your-dsn@sentry.io/project-id` | クライアント用DSN |
| `SENTRY_ORG` | `your-organization-slug` | Organization Slug |
| `SENTRY_PROJECT` | `boxlog-app` | プロジェクト名 |
| `SENTRY_AUTH_TOKEN` | `your-auth-token` | 認証トークン |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | アプリバージョン |

#### 3. デプロイと確認

```bash
# dev ブランチにプッシュ → 自動デプロイ
git push origin dev

# デプロイ完了後、本番環境でテスト
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/test-sentry
```

**確認ポイント**:
- [ ] プロジェクトが正常にデプロイされている
- [ ] 本番環境でエラーが記録される
- [ ] パフォーマンスデータが収集される
- [ ] ソースマップが正常に動作する

---

## アーキテクチャ

### ディレクトリ構造

```
boxlog-app/
├── src/lib/sentry/              # Sentry実装
│   ├── index.ts                 # エクスポート
│   ├── integration.ts           # エラーパターン統合
│   └── performance.ts           # パフォーマンス監視
├── scripts/sentry/              # ヘルパースクリプト
│   ├── connection-test.js       # 接続テスト
│   └── dsn-guide.js             # DSN設定ガイド
├── .sentryclirc                 # Sentry CLI設定（ルート必須）
├── sentry.config.ts             # サーバー・Edge共通設定（ルート必須）
├── instrumentation.ts           # Next.js instrumentation（ルート必須）
└── instrumentation-client.ts    # クライアント側instrumentation（ルート必須）
```

### データフロー

```
エラー発生
  ↓
AppError生成（エラーパターン辞書）
  ↓
SentryIntegration.reportError()
  ↓
カテゴリ別タグ付与・フィンガープリント生成
  ↓
Sentry送信（自動分類・構造化）
  ↓
Sentryダッシュボード表示
```

### カテゴリ別タグ設定

```typescript
const CATEGORY_TAGS = {
  AUTH: {
    domain: 'authentication',
    priority: 'high',
    team: 'security',
    alerting: 'immediate'
  },
  DB: {
    domain: 'database',
    priority: 'critical',
    team: 'backend',
    alerting: 'immediate'
  },
  // ... 他のカテゴリ
}
```

---

## 実装ガイド

### エラーハンドリング

#### 基本的な使い方

```typescript
import { reportToSentry } from '@/lib/sentry'
import { AppError } from '@/config/error-patterns'

try {
  await fetchUserData(userId)
} catch (error) {
  const appError = new AppError(
    'ユーザーデータの取得に失敗',
    'DATA_NOT_FOUND_404',
    { userId, originalError: error }
  )
  reportToSentry(appError)
  throw appError
}
```

#### Reactコンポーネントでのエラー

```typescript
import { handleReactError } from '@/lib/sentry'

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleReactError(error, errorInfo)
  }
}
```

#### APIルートでのエラー

```typescript
import { handleApiError } from '@/lib/sentry'

export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return Response.json(data)
  } catch (error) {
    handleApiError(error as Error, {
      endpoint: '/api/data',
      method: 'GET'
    })
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### パフォーマンス監視

#### 自動測定

```typescript
// src/app/layout.tsx
import { initPerformanceMonitoring } from '@/lib/sentry/performance'

export default function RootLayout({ children }) {
  useEffect(() => {
    initPerformanceMonitoring() // Core Web Vitals・API応答時間の自動測定
  }, [])

  return <html>{children}</html>
}
```

#### カスタムトランザクション

```typescript
import * as Sentry from '@sentry/nextjs'

const transaction = Sentry.startTransaction({
  name: 'Custom Operation',
  op: 'custom'
})

try {
  await performOperation()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

#### カスタムメトリクス

```typescript
import * as Sentry from '@sentry/nextjs'

// カスタムメトリクス記録
Sentry.setMeasurement('custom_metric', 123, 'millisecond')

// パンくずリスト追加
Sentry.addBreadcrumb({
  message: 'User performed action',
  category: 'user-action',
  level: 'info',
  data: { action: 'click', target: 'button' }
})
```

---

## 運用

### ダッシュボード確認

#### Issues タブ
- 発生したエラーの一覧
- エラーの頻度・影響ユーザー数
- スタックトレース・ユーザーコンテキスト

#### Performance タブ
- ページロード時間
- API応答時間
- Core Web Vitals (LCP, FID, CLS)

#### Releases タブ
- デプロイバージョン別のエラー追跡
- リグレッション検出

### アラート設定

#### 推奨アラートルール

1. **Critical Errors**
   - 条件: `severity:fatal` または `category:DB`
   - 通知: 即座にSlack/Email

2. **High Error Rate**
   - 条件: 1時間に50件以上のエラー
   - 通知: Slack/Email

3. **Performance Degradation**
   - 条件: LCP > 2.5秒
   - 通知: 日次レポート

### チームコラボレーション

#### Issue割り当て
- カテゴリ別タグ（`team:security`, `team:backend`）で自動割り当て
- 優先度タグ（`priority:critical`, `priority:high`）で優先順位付け

#### コメント・ディスカッション
- Issueに対するコメント・解決方法の共有
- GitHubとの連携でコミット・PRとのリンク

---

## トラブルシューティング

### 接続エラー

**症状**: `[Sentry] Cannot initialize SDK with the given DSN`

**解決方法**:
1. DSN の形式を確認（`https://xxx@sentry.io/xxx`）
2. `.env.local` の変数名を確認（`NEXT_PUBLIC_SENTRY_DSN`）
3. 開発サーバーを再起動

```bash
# 接続テスト実行
node scripts/sentry/connection-test.js
```

### Auth Token エラー

**症状**: `[Sentry] Unauthorized`

**解決方法**:
1. Auth Token のスコープを確認
   - `project:releases` ✅
   - `project:write` ✅
   - `org:read` ✅
2. トークンの有効期限を確認
3. 新しいトークンを生成して再設定

### ソースマップが表示されない

**症状**: Sentryダッシュボードで元のTypeScriptコードが表示されない

**解決方法**:
1. `.sentryclirc` ファイルの設定を確認
2. ビルド時にソースマップがアップロードされているか確認

```bash
# ビルドログで確認
npm run build

# Sentry CLIで手動アップロード
npx @sentry/cli releases files <version> upload-sourcemaps ./build
```

### パフォーマンス監視が動作しない

**症状**: Performance タブにデータが表示されない

**解決方法**:
1. Sentryプロジェクトで **Performance** が有効か確認
2. `tracesSampleRate` の設定を確認（`sentry.server.config.ts`）
3. `web-vitals` パッケージがインストールされているか確認

```bash
npm install web-vitals
```

### 開発環境でノイズが多い

**症状**: 開発中に不要なエラーが大量に送信される

**解決方法**:
1. 開発環境でのフィルタリング設定を確認（`src/lib/sentry/integration.ts`）
2. 環境変数で開発環境を無効化

```bash
# .env.local
NEXT_PUBLIC_SENTRY_ENABLED=false  # 開発環境で無効化
```

---

## FAQ

### Q1. Sentryの料金は？

BoxLogは無料プランで十分です：
- 月5,000エラー
- 月10,000トランザクション
- 30日間のデータ保持

### Q2. エラーレートの目安は？

- **正常**: 1日あたり10件未満
- **注意**: 1日あたり10〜50件
- **警告**: 1日あたり50件以上（調査必要）

### Q3. パフォーマンス目標値は？

Core Web Vitals目標：
- **LCP** (Largest Contentful Paint): < 2.5秒
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Q4. ソースマップは本番環境に公開される？

いいえ。ソースマップはSentryに直接アップロードされ、本番環境には含まれません。

### Q5. ユーザーのプライバシーは保護される？

はい。以下の対応を実施：
- 個人情報（メールアドレス、パスワード等）はマスキング
- IPアドレスは匿名化オプション有効
- GDPRコンプライアンス対応

### Q6. エラーが発生しても通知が来ない

**アラートルール**を設定してください：
1. Sentry Dashboard → **Alerts** → **Create Alert**
2. 条件・通知先（Slack/Email）を設定

### Q7. テスト環境のエラーを除外したい

環境別フィルタリング：

```typescript
// src/lib/sentry/integration.ts
beforeSend: (event) => {
  if (event.environment === 'test') {
    return null // テスト環境のエラーを送信しない
  }
  return event
}
```

---

## 参考リンク

### 公式ドキュメント
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Error Monitoring](https://docs.sentry.io/product/issues/)

### BoxLog関連
- **エラーパターン辞書**: [`/src/config/error-patterns/`](/src/config/error-patterns/)
- **エラーハンドリングガイド**: [`/docs/ERROR_PATTERNS_GUIDE.md`](/docs/ERROR_PATTERNS_GUIDE.md)
- **ビジネスルール**: [`/docs/BUSINESS_RULES_GUIDE.md`](/docs/BUSINESS_RULES_GUIDE.md)

### ヘルパースクリプト
- **接続テスト**: `node scripts/sentry/connection-test.js`
- **DSNガイド**: `node scripts/sentry/dsn-guide.js`

---

**📖 最終更新**: 2025-09-30
**バージョン**: 1.0
**メンテナー**: BoxLog Development Team