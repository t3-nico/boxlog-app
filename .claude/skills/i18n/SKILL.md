---
name: i18n
description: 国際化スキル。UIテキストを含むコンポーネント作成時、ハードコードされた文字列検出時に自動発動。next-intlパターンに沿った翻訳キー追加を支援。
---

# 国際化（i18n）スキル

Dayoptの国際化対応を支援するスキル。next-intl v4を使用。

## When to Use（自動発動条件）

以下の状況で自動発動：

- UIテキストを含むコンポーネント作成・編集時
- ハードコードされた日本語/英語文字列を検出した時
- 翻訳ファイルの編集が必要な時
- 「翻訳」「i18n」「多言語」等のキーワード

## 技術スタック

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| ライブラリ | next-intl v4.5.8                       |
| 対応言語   | English (en), 日本語 (ja)              |
| デフォルト | English                                |
| URL方式    | as-needed（/ja/\* のみプレフィックス） |

## 翻訳ファイル構造

```
messages/
├── en/              # 英語（デフォルト）
│   ├── app.json
│   ├── auth.json
│   ├── calendar.json
│   ├── common.json
│   ├── error.json
│   ├── navigation.json
│   ├── plan.json
│   ├── settings.json
│   ├── tag.json
│   └── ...
└── ja/              # 日本語（同じ構造）
```

## 使用パターン

### Server Component

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('common');
  return <h1>{t('title')}</h1>;
}
```

### Client Component

```typescript
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}
```

### 変数埋め込み

```typescript
// messages/en/common.json
{ "greeting": "Hello, {name}!" }

// Component
t('greeting', { name: 'John' })
```

### 複数形

```typescript
// messages/en/common.json
{ "items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}" }

// Component
t('items', { count: 5 })  // "5 items"
```

## 新規翻訳キー追加手順

### 1. ネームスペース選択

| ネームスペース | 用途                             |
| -------------- | -------------------------------- |
| `common`       | 汎用（保存、キャンセル、削除等） |
| `app`          | アプリ全体のUI                   |
| `auth`         | 認証関連                         |
| `calendar`     | カレンダー機能                   |
| `plan`         | プラン関連                       |
| `tag`          | タグ関連                         |
| `settings`     | 設定画面                         |
| `error`        | エラーメッセージ                 |
| `navigation`   | ナビゲーション                   |

### 2. 両言語に追加

**必ず en と ja の両方に追加する**

```json
// messages/en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// messages/ja/common.json
{
  "newFeature": {
    "title": "新機能",
    "description": "これは新機能です"
  }
}
```

### 3. 検証

```bash
npm run i18n:check    # 翻訳キー差分チェック（en/ja）
npm run i18n:unused   # 未使用キーの検出
```

## 禁止事項

### ❌ ハードコードされた文字列

```typescript
// ❌ 禁止
<button>保存</button>
<p>エラーが発生しました</p>

// ✅ 正しい
<button>{t('save')}</button>
<p>{t('error.generic')}</p>
```

### ❌ 片方の言語のみ追加

```typescript
// ❌ en のみ追加、ja を忘れる
// → npm run i18n:check でエラーになる
```

### ❌ 直接インポートではなくネームスペース経由

```typescript
// ❌ 禁止（個別ファイルインポート）
import messages from '@/messages/en/common.json';

// ✅ 正しい（next-intl経由）
const t = useTranslations('common');
```

## チェックリスト

新しいUIテキスト追加時：

- [ ] 適切なネームスペースを選択したか
- [ ] en/ja 両方に追加したか
- [ ] キー名は意味のあるドット記法か（例: `plan.create.title`）
- [ ] 変数がある場合は `{variable}` 形式か
- [ ] `npm run i18n:check` が通るか

## 言語検出の仕組み

1. URLパスから言語を検出（`/ja/*` → 日本語）
2. デフォルトは英語（プレフィックスなし）
3. ミドルウェア（`src/middleware.ts`）が自動処理

## 関連ファイル

- `src/i18n/routing.ts` - ルーティング設定
- `src/i18n/request.ts` - メッセージローダー
- `src/i18n/navigation.ts` - ナビゲーションユーティリティ
- `src/middleware.ts` - 言語検出ミドルウェア
