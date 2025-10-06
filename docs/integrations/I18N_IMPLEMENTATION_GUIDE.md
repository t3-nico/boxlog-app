# i18n実装ガイド - BoxLog

**最終更新**: 2025-10-02
**対応言語**: 日本語 (ja) / 英語 (en)

## 📋 目次

1. [基本設計](#基本設計)
2. [実装パターン](#実装パターン)
3. [翻訳キー規約](#翻訳キー規約)
4. [実装例](#実装例)

---

## 基本設計

### アーキテクチャ

BoxLogのi18nは**App Router**に最適化された軽量実装です：

- **サーバーコンポーネント主体**: `getDictionary()` + `createTranslation()`
- **カスタムhook不要**: next-i18next風のhookは使わない
- **辞書のprops渡し**: 親（サーバー）→ 子（クライアント）

```typescript
// ❌ 不要: カスタムhook作成
// next-i18next風のhookは必要ない

// ✅ 既存のシステムで十分シンプル:
// サーバーコンポーネント
const dictionary = await getDictionary(locale)
const t = createTranslation(dictionary, locale)

// クライアントコンポーネント
// 親から辞書を渡す（propsで）
```

---

## 実装パターン

### パターン1: サーバーコンポーネント（推奨）

**使用場所**: 静的ページ、設定ページ、ダッシュボードなど

```typescript
// src/app/(app)/settings/general/page.tsx
import { getDictionary, createTranslation } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

interface PageProps {
  params: { locale: Locale }
}

export default async function GeneralSettingsPage({ params }: PageProps) {
  const { locale } = params
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  return (
    <div>
      <h1>{t('settings.general.title')}</h1>
      <p>{t('settings.general.description')}</p>
    </div>
  )
}
```

### パターン2: クライアントコンポーネント（propsで翻訳渡し）

**使用場所**: インタラクティブなページ、動的コンテンツ

#### 親（サーバーコンポーネント）

```typescript
// src/app/(app)/calendar/[view]/page.tsx
import { getDictionary, createTranslation } from '@/lib/i18n'
import CalendarViewClient from './client'

export default async function CalendarViewPage({ params }: PageProps) {
  const dictionary = await getDictionary(params.locale)
  const t = createTranslation(dictionary, params.locale)

  // 必要な翻訳のみ抽出
  const translations = {
    errorTitle: t('calendar.errors.loadFailed'),
    errorMessage: t('calendar.errors.displayFailed'),
    reloadButton: t('common.reload'),
  }

  return <CalendarViewClient translations={translations} />
}
```

#### 子（クライアントコンポーネント）

```typescript
// src/app/(app)/calendar/[view]/client.tsx
'use client'

interface Props {
  translations: {
    errorTitle: string
    errorMessage: string
    reloadButton: string
  }
}

export default function CalendarViewClient({ translations }: Props) {
  return (
    <div>
      <h1>{translations.errorTitle}</h1>
      <p>{translations.errorMessage}</p>
      <button>{translations.reloadButton}</button>
    </div>
  )
}
```

### パターン3: 変数補間

```typescript
const t = createTranslation(dictionary, locale)

// シンプルな変数補間
t('welcome.message', { name: 'John' })
// 出力: "Welcome, John!"

// 翻訳キー (ja.json):
// "welcome": { "message": "ようこそ、{{name}}さん！" }
```

### パターン4: 複数形処理

```typescript
// ICU Message Format
t.icu('{count, plural, =0{No items} =1{1 item} other{# items}}', 5)
// 出力: "5 items"

// オブジェクト形式
t.plural('items.count', 3, { type: 'task' })
// 翻訳キー:
// "items": {
//   "count": {
//     "zero": "{{type}}がありません",
//     "one": "1件の{{type}}",
//     "other": "{{count}}件の{{type}}"
//   }
// }
```

---

## 翻訳キー規約

### ディレクトリ構造

```
src/lib/i18n/dictionaries/
├── ja.json  # 日本語
└── en.json  # 英語
```

### 命名規則

```json
{
  "機能名": {
    "サブ機能": {
      "キー": "値"
    }
  }
}
```

**例**:

```json
{
  "calendar": {
    "views": {
      "day": "日表示",
      "week": "週表示"
    },
    "errors": {
      "loadFailed": "読み込みに失敗しました"
    }
  }
}
```

### 共通キー

頻出する翻訳は `common` に配置：

```json
{
  "common": {
    "save": "保存",
    "cancel": "キャンセル",
    "reload": "ページをリロード",
    "loading": "読み込み中...",
    "noData": "データがありません"
  }
}
```

---

## 実装例

### 例1: 設定ページ（サーバーコンポーネント）

```typescript
// src/app/(app)/settings/calendar/page.tsx
import { getDictionary, createTranslation } from '@/lib/i18n'
import { SettingsLayout } from '@/components/layouts/SettingsLayout'

export default async function CalendarSettingsPage({ params }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(params.locale)
  const t = createTranslation(dictionary, params.locale)

  return (
    <SettingsLayout
      title={t('settings.calendar.title')}
      description={t('settings.calendar.description')}
    >
      {/* 設定フォーム */}
    </SettingsLayout>
  )
}
```

### 例2: エラーフォールバック（クライアント）

```typescript
// 親（サーバー）
const translations = {
  errorTitle: t('calendar.errors.loadFailed'),
  errorMessage: t('calendar.errors.displayFailed'),
  reloadButton: t('common.reload'),
}

// 子（クライアント）
<ErrorBoundary
  fallback={
    <div>
      <h2>{translations.errorTitle}</h2>
      <p>{translations.errorMessage}</p>
      <button onClick={() => location.reload()}>
        {translations.reloadButton}
      </button>
    </div>
  }
>
  {children}
</ErrorBoundary>
```

---

## チェックリスト

新しいページ/機能を追加する際：

- [ ] 翻訳キーを `ja.json` と `en.json` に追加
- [ ] サーバーコンポーネントで実装可能か確認
- [ ] クライアント側で必要な翻訳のみpropsで渡す
- [ ] ハードコードされた文字列を翻訳関数に置き換え
- [ ] 変数補間・複数形処理が必要か確認

---

## 参考リンク

- [i18n設定ファイル](../../src/lib/i18n/index.ts)
- [翻訳辞書（日本語）](../../src/lib/i18n/dictionaries/ja.json)
- [翻訳辞書（英語）](../../src/lib/i18n/dictionaries/en.json)
- [Middleware](../../middleware.ts) - 言語検出・リダイレクト
