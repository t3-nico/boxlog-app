# src/ - ソースコード構造

BoxLogアプリケーションのソースコードディレクトリ構造説明。

## 📁 ディレクトリ構造

```
src/
├── app/              # Next.js 14 App Router
│   ├── (routes)/     # ページルーティング
│   ├── api/          # APIエンドポイント
│   └── layout.tsx    # ルートレイアウト
├── components/       # 共通UIコンポーネント
│   ├── ui/           # shadcn/ui基本コンポーネント
│   └── layouts/      # レイアウトコンポーネント
├── config/           # 設定ファイル
│   ├── theme/        # デザインシステム（必須使用）
│   └── constants.ts  # アプリケーション定数
├── features/         # 機能別モジュール
│   ├── tasks/        # タスク管理機能
│   ├── auth/         # 認証機能
│   └── ...
├── hooks/            # カスタムReact Hooks
├── lib/              # ユーティリティ・ライブラリ
│   ├── business-rules/ # ビジネスルール辞書
│   ├── supabase/     # Supabase クライアント
│   └── utils/        # 汎用ユーティリティ
├── providers/        # Reactコンテキストプロバイダー
├── schemas/          # Zodスキーマ定義
├── server/           # サーバーサイドロジック
└── types/            # TypeScript型定義
```

---

## 🎯 主要ディレクトリ詳細

### app/ - App Router

Next.js 14のApp Routerを使用した画面ルーティング。

**重要ファイル**:

- `layout.tsx` - ルートレイアウト
- `page.tsx` - ページコンポーネント
- `api/` - APIルート

### components/ - 共通コンポーネント

再利用可能なUIコンポーネント。

**選択優先度**:

1. **shadcn/ui** - 基本UIコンポーネント
2. **kiboUI** - AI・高度な機能
3. **カスタム実装** - 最後の手段

### config/ - 設定

アプリケーション全体の設定。

**🚨 必須**: `/config/theme` のデザインシステムを全スタイリングで使用。

### features/ - 機能モジュール

機能別に独立したモジュール。

**構造**:

```
features/tasks/
├── components/      # 機能専用コンポーネント
├── hooks/           # 機能専用hooks
├── stores/          # 状態管理
└── utils/           # 機能専用ユーティリティ
```

### lib/ - ライブラリ・ユーティリティ

共通ロジック・外部サービス連携。

**重要モジュール**:

- `business-rules/` - ビジネスルール辞書システム
- `supabase/` - データベースクライアント
- `errors/` - 統一エラーコードシステム

---

## 🔧 開発ガイドライン

### 新規コンポーネント作成

```bash
# 1. 適切なディレクトリに配置
src/features/tasks/components/TaskCard.tsx

# 2. コロケーション方式でテスト配置
src/features/tasks/components/TaskCard.test.tsx
```

### インポートパス

```tsx
// ✅ エイリアス使用（@/）
import { colors } from '@/config/theme'
import { useTaskStore } from '@/features/tasks/stores'

// ❌ 相対パス多用は避ける
import { colors } from '../../../../config/theme'
```

### スタイリング

```tsx
// ✅ 必須：themeシステム
import { colors, spacing } from '@/config/theme'
<div className={colors.background.base}>

// ❌ 禁止：直接指定
<div className="bg-white p-4">
```

---

## 🔗 関連ドキュメント

- **コーディングルール**: [`CLAUDE.md`](./CLAUDE.md)
- **デザインシステム**: [`config/theme/README.md`](./config/theme/README.md)
- **ビジネスルール**: [`../docs/BUSINESS_RULES_GUIDE.md`](../docs/BUSINESS_RULES_GUIDE.md)
- **テスト戦略**: [`../docs/ESLINT_SETUP_COMPLETE.md`](../docs/ESLINT_SETUP_COMPLETE.md)

---

**📖 最終更新**: 2025-09-30
