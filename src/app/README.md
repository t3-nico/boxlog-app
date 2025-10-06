# src/app - Next.js App Router

BoxLogアプリケーションのNext.js 14 App Routerディレクトリです。

## 📁 ディレクトリ構成

```
src/app/
├── [locale]/               # 国際化対応ルート
│   └── (app)/             # アプリケーションページグループ
│       ├── settings/      # 設定画面
│       ├── calendar/      # カレンダー
│       ├── board/         # ボード
│       ├── table/         # テーブル
│       ├── stats/         # 統計・分析
│       └── ai-chat/       # AIチャット
├── api/                   # APIルート
│   └── middleware/        # API middleware
├── error/                 # エラーページ
├── favicon.ico           # ファビコン
├── globals.css           # グローバルCSS
├── layout.tsx            # ルートレイアウト
└── README.md             # このファイル
```

## 🎯 主要機能

### アプリケーションページ（[locale]/(app)/）

| パス | 機能 |
|---|---|
| `/settings` | 設定画面（14サブページ） |
| `/calendar` | カレンダービュー |
| `/board` | カンバンボード |
| `/table` | テーブルビュー |
| `/stats` | 統計・分析 |
| `/ai-chat` | AIチャット |

### 設定ページ一覧

1. `/settings` - 設定トップ
2. `/settings/general` - 一般設定
3. `/settings/account` - アカウント設定
4. `/settings/preferences` - 表示設定
5. `/settings/calendar` - カレンダー設定
6. `/settings/chronotype` - クロノタイプ設定
7. `/settings/tags` - タグ管理
8. `/settings/templates` - テンプレート管理
9. `/settings/data-export` - データエクスポート
10. `/settings/trash` - ゴミ箱
11. `/settings/plan-billing` - プラン・請求
12. `/settings/integration` - 外部連携
13. `/settings/notifications` - 通知設定
14. `/settings/legal` - 利用規約・プライバシー

## 🌐 国際化（i18n）

- **[locale]**: 動的ルートパラメータ
- 対応言語: `ja` (日本語), `en` (英語)
- 実装: `next-intl` ライブラリ

## 📖 API Routes

詳細は [`src/app/api/README.md`](api/README.md) を参照してください。

- tRPC API: Pages Router (`pages/api/trpc/[trpc].ts`) と共存
- Middleware: 認証・レート制限・エラーハンドリング

## 🔧 技術仕様

### App Router規約

| ファイル | 用途 |
|---|---|
| `layout.tsx` | レイアウトコンポーネント |
| `page.tsx` | ページコンポーネント |
| `loading.tsx` | ローディングUI |
| `error.tsx` | エラーUI |
| `not-found.tsx` | 404ページ |

### Server Components vs Client Components

- **デフォルト**: Server Components（パフォーマンス最適化）
- **'use client'**: インタラクティブなUIのみ

### メタデータ

```typescript
// layout.tsx または page.tsx
export const metadata: Metadata = {
  title: 'BoxLog',
  description: '...',
}
```

## 🚨 重要な注意事項

1. **App Routerのみ**: 新規ページは必ず`app/`以下に作成
2. **Pages Routerは非推奨**: `pages/`は tRPC API専用
3. **Dynamic Routes**: `[param]`で動的ルート
4. **Route Groups**: `(group)`でURL影響なしのグループ化

## 🔗 関連ドキュメント

- **API**: [`src/app/api/README.md`](api/README.md)
- **機能別コンポーネント**: [`src/features/README.md`](../features/README.md)
- **共通コンポーネント**: [`src/components/README.md`](../components/README.md)

---

**📖 参照**: [Next.js App Router公式ドキュメント](https://nextjs.org/docs/app)
**最終更新**: 2025-10-06
