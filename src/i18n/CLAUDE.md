# i18n 実装ガイド

## ディレクトリ構造

```
messages/
├── en/                    # 英語
│   ├── common.json        # 共通UI
│   ├── auth.json          # 認証
│   ├── calendar.json      # カレンダー
│   └── ...
└── ja/                    # 日本語
    └── (同構造)

src/i18n/
├── routing.ts             # ルーティング設定
├── request.ts             # メッセージローダー
├── navigation.ts          # next-intl ナビゲーション
└── CLAUDE.md              # 本ドキュメント
```

## 命名規則

### ファイル名

| ルール | 例 |
|--------|-----|
| **1ファイル = 1ドメイン** | `calendar.json` → `calendar` ドメインのみ |
| **camelCase** | `aiChat.json` ✅ / `ai-chat.json` ❌ |

### キー構造

```
domain.section.key
```

| 階層 | 説明 | 例 |
|------|------|-----|
| 1 | ドメイン（ファイル名と一致） | `calendar` |
| 2 | セクション/機能 | `toolbar`, `events` |
| 3 | 具体的な意味 | `title`, `description` |
| 4 | 特殊ケースのみ | `calendar.toolbar.view.month` |

### 良い例 / 悪い例

```json
// ✅ 良い例 (calendar.json)
{
  "calendar": {
    "toolbar": {
      "today": "Today",
      "view": {
        "month": "Month",
        "week": "Week"
      }
    }
  }
}

// ❌ 悪い例
{
  "cal_toolbar_today": "Today",     // フラット過ぎる
  "calendar.toolbar.today": "Today", // ドット区切りの文字列キー
  "Calendar": { ... }                // PascalCase
}
```

## 使用方法

### Server Component

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return <h1>{t('calendar.toolbar.today')}</h1>
}
```

### Client Component

```typescript
'use client'

import { useTranslations } from 'next-intl'

export function CalendarToolbar() {
  const t = useTranslations()

  return <button>{t('calendar.toolbar.today')}</button>
}
```

### ネームスペース指定

```typescript
// 特定ネームスペースのみ使用
const t = await getTranslations({ locale, namespace: 'calendar' })
t('toolbar.today')  // calendar.toolbar.today
```

## ネームスペース一覧

| ネームスペース | 用途 |
|----------------|------|
| `ai` | AI基本機能 |
| `aiChat` | AIチャット |
| `app` | アプリ全般 |
| `auth` | 認証 |
| `board` | ボード |
| `calendar` | カレンダー |
| `common` | 共通UI |
| `errors` | エラーメッセージ |
| `events` | イベント |
| `help` | ヘルプ |
| `legal` | 法的文書 |
| `navigation` | ナビゲーション |
| `notifications` | 通知 |
| `settings` | 設定 |
| `stats` | 統計 |
| `table` | テーブル |
| `tags` | タグ |

## 新規ネームスペース追加

1. `messages/en/{namespace}.json` を作成
2. `messages/ja/{namespace}.json` を作成
3. `src/i18n/request.ts` の `NAMESPACES` 配列に追加

```typescript
const NAMESPACES = [
  // ... 既存
  'newNamespace',  // 追加
] as const
```

## 検証スクリプト

```bash
# 翻訳キーの差分チェック（en/ja）
npm run i18n:check

# 未使用キーの検出
npm run i18n:unused
```

## 参考

- [next-intl 公式ドキュメント](https://next-intl-docs.vercel.app/)
- [App Router での使用](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
