# Sentry 統合ガイド

BoxLogアプリケーションにおけるSentryの統合・設定・運用の完全ガイド。

**📘 アラート設定の詳細手順**: [`SENTRY_ALERT_SETUP.md`](./SENTRY_ALERT_SETUP.md)

## 📋 目次

- [概要](#概要)
- [アーキテクチャ（v2.0）](#アーキテクチャv20)
- [セットアップ](#セットアップ)
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

## アーキテクチャ（v2.0）

### Sentry SDK v10 + Next.js 15 ベストプラクティス

BoxLogは **Sentry SDK v10** と **Next.js 15** の公式推奨構成に従っています。

### ファイル構成

```
boxlog-app/
├── instrumentation.ts           # サーバー・エッジ初期化ルーター（Next.js 15標準）
├── instrumentation-client.ts    # クライアント初期化
├── sentry.server.config.ts      # Node.jsランタイム設定
├── sentry.edge.config.ts        # Edgeランタイム設定
├── next.config.mjs              # withSentryConfig()統合
├── .sentryclirc                 # Sentry CLI設定
└── src/lib/sentry/              # ヘルパー関数
    ├── index.ts                 # エクスポート
    ├── integration.ts           # エラーパターン統合
    ├── performance.ts           # パフォーマンス監視
    └── trace.ts                 # カスタムトレース
```

### 各ファイルの役割

| ファイル                    | 実行環境       | 責務                                   |
| --------------------------- | -------------- | -------------------------------------- |
| `instrumentation.ts`        | サーバー起動時 | 環境判定してserver/edge設定を読み込み  |
| `instrumentation-client.ts` | ブラウザ       | クライアント初期化・Replay・Web Vitals |
| `sentry.server.config.ts`   | Node.js        | サーバーサイドエラー監視               |
| `sentry.edge.config.ts`     | Edge Runtime   | Middleware/Edge API監視                |
| `next.config.mjs`           | ビルド時       | ソースマップアップロード・設定統合     |

### データフロー

```
エラー発生
  ↓
AppError生成（エラーパターン辞書）
  ↓
reportToSentry()
  ↓
カテゴリ別タグ付与・フィンガープリント生成
  ↓
Sentry送信（自動分類・構造化）
  ↓
Sentryダッシュボード表示
```

### 環境別設定

| 環境        | トレースサンプリング | Session Replay   | 有効/無効 |
| ----------- | -------------------- | ---------------- | --------- |
| Production  | 10%                  | エラー時のみ100% | 有効      |
| Preview     | 50%                  | なし             | 有効      |
| Development | 100%                 | なし             | 無効      |

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
# Sentry設定検証
npm run sentry:verify

# 開発サーバー起動
npm run dev

# テストエンドポイントにアクセス
curl http://localhost:3000/api/test/sentry?type=message
curl http://localhost:3000/api/test/sentry?type=error

# Sentryダッシュボードで確認（5分以内）
# https://sentry.io/organizations/[YOUR_ORG]/issues/
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

| 変数名                    | 値                                      | 説明              |
| ------------------------- | --------------------------------------- | ----------------- |
| `NEXT_PUBLIC_SENTRY_DSN`  | `https://your-dsn@sentry.io/project-id` | クライアント用DSN |
| `SENTRY_ORG`              | `your-organization-slug`                | Organization Slug |
| `SENTRY_PROJECT`          | `boxlog-app`                            | プロジェクト名    |
| `SENTRY_AUTH_TOKEN`       | `your-auth-token`                       | 認証トークン      |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0`                                 | アプリバージョン  |

#### 3. デプロイと確認

```bash
# dev ブランチにプッシュ → 自動デプロイ
git push origin dev

# デプロイ完了後、本番環境でテスト
curl https://your-app.vercel.app/api/health
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
  const appError = new AppError('ユーザーデータの取得に失敗', 'DATA_NOT_FOUND_404', {
    userId,
    originalError: error,
  })
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
      method: 'GET',
    })
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### パフォーマンス監視

#### Web Vitals自動計測（2025基準準拠）

Web Vitalsは `instrumentation-client.ts` で自動計測されます。

**計測される指標（Google 2025基準）**:

- **LCP** (Largest Contentful Paint): ≤ 2.5s (Good), > 4.0s (Poor)
- **INP** (Interaction to Next Paint): ≤ 200ms (Good), > 500ms (Poor)
- **CLS** (Cumulative Layout Shift): < 0.1 (Good), > 0.25 (Poor)
- **FCP** (First Contentful Paint): < 1.8s (Good), > 3.0s (Poor)
- **TTFB** (Time to First Byte): < 800ms (Good), > 1800ms (Poor)

#### カスタムパフォーマンストレース

```typescript
import { withTrace, traceApiCall, traceDbQuery } from '@/lib/sentry'

// API呼び出し計測
const tasks = await traceApiCall('GET /tasks', async () => {
  return await api.get('/tasks')
})

// データベースクエリ計測
const user = await traceDbQuery('users.findUnique', async () => {
  return await prisma.user.findUnique({ where: { id } })
})

// 汎用トレース
const { result, duration } = await withTrace(
  'complex-calculation',
  async () => {
    return await heavyComputation()
  },
  {
    op: 'function',
    tags: { complexity: 'high' },
  }
)
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
- Core Web Vitals 2025 (LCP, INP, CLS, FCP, TTFB)

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

3. **Performance Degradation (2025基準)**
   - 条件: LCP > 4.0秒（Poor）または INP > 500ms（Poor）
   - 通知: 日次レポート

4. **新規エラー検知**
   - 条件: 初めて発生したエラー
   - 通知: 即座にメール

5. **ユーザー影響大**
   - 条件: 影響ユーザー > 10人/時
   - 通知: Slack（緊急チャンネル）

### カテゴリ別タグ設定

```typescript
const CATEGORY_TAGS = {
  AUTH: {
    domain: 'authentication',
    priority: 'high',
    team: 'security',
    alerting: 'immediate',
  },
  DB: {
    domain: 'database',
    priority: 'critical',
    team: 'backend',
    alerting: 'immediate',
  },
  // ... 他のカテゴリ
}
```

---

## トラブルシューティング

### 接続エラー

**症状**: `[Sentry] Cannot initialize SDK with the given DSN`

**解決方法**:

1. DSN の形式を確認（`https://xxx@sentry.io/xxx`）
2. `.env.local` の変数名を確認（`NEXT_PUBLIC_SENTRY_DSN`）
3. 開発サーバーを再起動

```bash
# Sentry設定検証（推奨）
npm run sentry:verify

# 接続テスト実行
npm run sentry:test
```

### CSPエラー

**症状**: ブラウザコンソールに `Refused to connect to 'https://xxx.sentry.io'`

**解決方法**:

`next.config.mjs` の CSP `connect-src` に以下が含まれていることを確認:

```javascript
const connectSrc = [
  // ...
  'https://*.sentry.io',
  'https://*.ingest.sentry.io',
]
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

1. `next.config.mjs` で `withSentryConfig` が適用されていることを確認
2. 環境変数が正しく設定されていることを確認:
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`
3. ビルドログでソースマップアップロードを確認

### 開発環境でノイズが多い

**症状**: 開発中に不要なエラーが大量に送信される

**解決方法**:

開発環境ではSentryは自動的に無効化されています（`sentry.server.config.ts` の `enabled` 設定）。

手動で有効化したい場合:

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DEBUG=true
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

Core Web Vitals目標（2025基準）：

- **LCP**: ≤ 2.5秒 (Good)
- **INP**: ≤ 200ms (Good)
- **CLS**: < 0.1 (Good)

### Q4. ソースマップは本番環境に公開される？

いいえ。`withSentryConfig` の `hideSourceMaps: true` と `deleteSourcemapsAfterUpload: true` により、ソースマップはSentryに直接アップロードされ、本番環境には含まれません。

### Q5. ユーザーのプライバシーは保護される？

はい。以下の対応を実施：

- Session Replayで `maskAllText: true`, `blockAllMedia: true`
- GDPR対応: Cookie同意がある場合のみSentry有効化
- 個人情報（メールアドレス、パスワード等）はマスキング

### Q6. 旧APIからの移行は？

`initializeSentry()` と `SentryIntegration` クラスは非推奨になりました。

```typescript
// ❌ 旧（非推奨）
import { initializeSentry, sentryIntegration } from '@/lib/sentry'
initializeSentry()
sentryIntegration.reportError(error)

// ✅ 新（推奨）
import { reportToSentry } from '@/lib/sentry'
reportToSentry(error)
```

Sentryの初期化は `instrumentation.ts` / `instrumentation-client.ts` で自動的に行われます。

---

## 参考リンク

### 公式ドキュメント

- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Error Monitoring](https://docs.sentry.io/product/issues/)

### BoxLog関連

- **エラーパターンガイド**: [`../architecture/ERROR_PATTERNS_GUIDE.md`](../architecture/ERROR_PATTERNS_GUIDE.md)
- **エラーハンドリング**: [`../architecture/ERROR_HANDLING.md`](../architecture/ERROR_HANDLING.md)

### ヘルパースクリプト

- **設定検証**: `npm run sentry:verify`
- **接続テスト**: `npm run sentry:test`

---

**📖 最終更新**: 2025-12-01
**バージョン**: 2.0
**メンテナー**: BoxLog Development Team

---

**種類**: 📗 ハウツーガイド
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
