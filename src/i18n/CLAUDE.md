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

| ルール                    | 例                                        |
| ------------------------- | ----------------------------------------- |
| **1ファイル = 1ドメイン** | `calendar.json` → `calendar` ドメインのみ |
| **単数形**                | `tag.json` ✅ / `tags.json` ❌            |
| **camelCase**             | `aiChat.json` ✅ / `ai-chat.json` ❌      |

**例外**: `settings`, `stats` は英語で複数形が自然なため許容

### キー構造

```
domain.section.key
```

| 階層 | 説明                         | 例                            |
| ---- | ---------------------------- | ----------------------------- |
| 1    | ドメイン（ファイル名と一致） | `calendar`                    |
| 2    | 画面名 or UIセクション名     | `toolbar`, `modal`, `form`    |
| 3    | 具体的な意味                 | `title`, `description`        |
| 4    | 特殊ケースのみ               | `calendar.toolbar.view.month` |

**section の許容値**:

- 画面名: `login`, `dashboard`, `detail`, `list`
- UIセクション: `header`, `sidebar`, `modal`, `form`, `toolbar`
- 例外: `validation`, `errors`, `actions` は概念セクションとして許容

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
const t = await getTranslations({ locale, namespace: 'calendar' });
t('toolbar.today'); // calendar.toolbar.today
```

## ネームスペース一覧

| ネームスペース | 用途                       |
| -------------- | -------------------------- |
| `app`          | アプリ全般（メタデータ等） |
| `auth`         | 認証                       |
| `board`        | ボード                     |
| `calendar`     | カレンダー                 |
| `common`       | 共通UI                     |
| `error`        | エラーメッセージ           |
| `legal`        | 法的文書                   |
| `navigation`   | ナビゲーション             |
| `notification` | 通知                       |
| `settings`     | 設定（例外: 複数形）       |
| `stats`        | 統計（例外: 複数形）       |
| `table`        | テーブル                   |
| `tag`          | タグ                       |

## 新規ネームスペース追加

1. `messages/en/{namespace}.json` を作成
2. `messages/ja/{namespace}.json` を作成
3. `src/i18n/request.ts` の `NAMESPACES` 配列に追加

```typescript
const NAMESPACES = [
  // ... 既存
  'newNamespace', // 追加
] as const;
```

## 検証スクリプト

```bash
# 翻訳キーの差分チェック（en/ja）
npm run i18n:check

# 未使用キーの検出
npm run i18n:unused
```

## webとの同期

このプロジェクト（app）の翻訳は、boxlog-webと一部共通化されています。

### 同期対象ファイル

| ファイル      | 同期先web | 備考                           |
| ------------- | --------- | ------------------------------ |
| `common.json` | 共通      | app構造ベース、web固有キー追加 |
| `legal.json`  | 共通      | 完全同期                       |

### 同期ルール

1. **app が正**：共通キーはこちら（app）が正
2. **web独自キー**：`navigation`, `footer`, `blog`, `releases` はweb固有
3. **構造統一**：両方同じキー構造を使用

### 同期手順

```bash
# Claude Codeで両リポジトリを開いた状態で
# appのmessages/を読み込み、webに反映
```

## 参考

- [next-intl 公式ドキュメント](https://next-intl-docs.vercel.app/)
- [App Router での使用](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [boxlog-web/src/i18n/CLAUDE.md](../../boxlog-web/src/i18n/CLAUDE.md) - web側のi18nガイド
