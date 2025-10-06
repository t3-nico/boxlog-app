# src/config - 設定管理システム

BoxLogアプリケーションの設定を一元管理するディレクトリです。

## 📁 ディレクトリ構成

```
src/config/
├── index.ts                  # 統合エクスポート（すべての設定をここから）
├── schema.ts                 # Zod設定スキーマ定義
├── loader.ts                 # 設定ファイル読み込みシステム
├── app/                      # アプリケーション設定
│   ├── constants.ts          # 定数(APP_CONFIG, LIMITS, TIMEOUTS)
│   └── features.ts           # 機能フラグ管理
├── ui/                       # UI/デザイン設定（⚠️最重要）
│   ├── theme.ts              # テーマカラー・タイポグラフィ・間隔
│   ├── views.ts              # ビュー別設定
│   ├── sidebarConfig.ts      # サイドバー設定
│   └── tagIcons.ts           # タグアイコン設定
├── navigation/               # ナビゲーション設定
│   └── config.ts             # ルーティング・メニュー構造
├── database/                 # データベース設定
│   ├── supabase.ts           # Supabase接続設定
│   └── migrations.ts         # マイグレーション管理
└── error-patterns/           # エラーハンドリング辞書
    ├── index.ts              # ErrorPatternDictionary
    ├── categories.ts         # エラー分類・重要度
    ├── messages.ts           # ユーザー向けメッセージ
    └── recovery-strategies.ts# リトライ・フォールバック戦略
```

## 🚀 基本的な使い方

### 統合インポート

すべての設定は `@/config` から一括インポート可能です：

```typescript
// ✅ 推奨：index.ts経由で一括インポート
import {
  APP_CONFIG,           // アプリケーション定数
  FEATURE_FLAGS,        // 機能フラグ
  colors,               // テーマカラー
  typography,           // タイポグラフィ
  primaryNavigation,    // ナビゲーション
  createAppError        // エラー作成
} from '@/config'

// ❌ 非推奨：個別ファイルへの直接アクセス
import { APP_CONFIG } from '@/config/app/constants'
```

### カテゴリ別の使用例

#### 1. アプリケーション設定

```typescript
import { APP_CONFIG, LIMITS, TIMEOUTS } from '@/config'

console.log(APP_CONFIG.name)      // 'BoxLog'
console.log(LIMITS.maxTasksPerPage) // 50
console.log(TIMEOUTS.autoSave)    // 3000ms
```

#### 2. 機能フラグ

```typescript
import { isFeatureEnabled } from '@/config'

if (isFeatureEnabled('enableAIChat')) {
  // AI機能を有効化
}
```

#### 3. テーマシステム（最重要）

```typescript
import { BRAND_COLORS, colors, typography } from '@/config'

export function MyComponent() {
  return (
    <div
      className={colors.background.card}
      style={{ borderColor: BRAND_COLORS.primary }}
    >
      <h2 className={typography.heading.h2}>Title</h2>
      <p className={colors.text.secondary}>Description</p>
    </div>
  )
}
```

**⚠️ 重要**: 色・スタイルの直接指定は禁止です。必ず `ui/theme.ts` の定数を使用してください。

#### 4. ナビゲーション

```typescript
import { primaryNavigation, getPageTitle } from '@/config'

// メニュー構造の取得
primaryNavigation.forEach(section => {
  section.items.forEach(item => {
    console.log(item.label, item.href)
  })
})

// ページタイトル取得
const title = getPageTitle('/calendar') // 'Calendar'
```

#### 5. エラーハンドリング

```typescript
import { createAppError, executeWithAutoRecovery } from '@/config'

// エラー作成
const error = createAppError(
  'Database connection failed',
  'DB_CONNECTION_TIMEOUT',
  { source: 'api', userId: '123' }
)

// 自動復旧付き実行
const result = await executeWithAutoRecovery(
  async () => await fetchData(),
  'API_NETWORK_ERROR'
)

if (!result.success) {
  console.error(result.error?.userMessage.title)
}
```

## 📚 詳細ドキュメント

各サブディレクトリの詳細は、それぞれのREADME.mdを参照してください：

- [ui/README.md](ui/README.md) - テーマシステム（**最重要**）
- [error-patterns/README.md](error-patterns/README.md) - エラーハンドリング
- [navigation/README.md](navigation/README.md) - ナビゲーション設定

## 🚨 絶対遵守ルール

1. **スタイリング**: 直接指定禁止 → `ui/theme.ts` のみ使用
2. **TypeScript厳格**: `any` 型禁止
3. **設定変更**: 必ず型安全性を確認（Zodスキーマ）

## 🔗 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - プロジェクト全体の開発指針
- [src/CLAUDE.md](../CLAUDE.md) - コーディング基本ルール
- [THEME_ENFORCEMENT.md](../../docs/THEME_ENFORCEMENT.md) - デザインシステム詳細

---

**最終更新**: 2025-10-06