# 国際化開発ガイドライン

BoxLogアプリケーションの国際化実装における完全な開発ガイドラインです。

## 🎯 概要

BoxLogでは英語を主言語、日本語を第二言語として、将来的な多言語展開を見据えた国際化システムを採用しています。

### サポート言語

- **英語 (en)**: 主言語・デフォルト
- **日本語 (ja)**: 第二言語
- **将来追加予定**: 中国語(zh)、韓国語(ko)、スペイン語(es)等

## 🏗️ アーキテクチャ

### システム構成

```
src/
├── lib/i18n/
│   ├── index.ts              # メインi18nライブラリ
│   ├── error-messages.ts     # エラーメッセージシステム
│   ├── dictionaries/
│   │   ├── en.json          # 英語翻訳辞書
│   │   └── ja.json          # 日本語翻訳辞書
│   └── __tests__/           # テストファイル
├── middleware.ts             # 言語ルーティング
├── app/[locale]/            # 動的言語ルート
└── components/i18n/         # 国際化コンポーネント
```

### 技術スタック

- **Next.js 14 App Router**: 動的ルーティング
- **TypeScript**: 型安全な翻訳システム
- **カスタムi18n**: 軽量・高性能
- **Vitest**: テストフレームワーク

## 📋 開発フロー

### 1. 新機能開発時の国際化フロー

```typescript
// ステップ1: 翻訳キーの設計
const translationKeys = {
  'feature.newFeature.title': '新機能のタイトル',
  'feature.newFeature.description': '説明文',
  'feature.newFeature.actions.submit': '送信'
};

// ステップ2: 英語・日本語辞書への追加
// src/lib/i18n/dictionaries/en.json
{
  "feature": {
    "newFeature": {
      "title": "New Feature Title",
      "description": "Description text",
      "actions": {
        "submit": "Submit"
      }
    }
  }
}

// ステップ3: コンポーネントでの使用
import { getDictionary, createTranslation } from '@/lib/i18n';

export default async function NewFeature({ params: { locale } }) {
  const dictionary = await getDictionary(locale);
  const t = createTranslation(dictionary);

  return (
    <div>
      <h1>{t('feature.newFeature.title')}</h1>
      <p>{t('feature.newFeature.description')}</p>
    </div>
  );
}

// ステップ4: テスト作成
it('新機能の翻訳が正常に動作する', async () => {
  const dictionary = await getDictionary('ja');
  const t = createTranslation(dictionary);
  expect(t('feature.newFeature.title')).toBe('新機能のタイトル');
});
```

### 2. 既存機能の国際化対応

```typescript
// Before: ハードコードされたテキスト
const Button = () => (
  <button>保存</button>
);

// After: 国際化対応
const Button = ({ locale, dictionary }) => {
  const t = createTranslation(dictionary);
  return (
    <button>{t('actions.save')}</button>
  );
};
```

## 🔧 実装パターン

### 1. サーバーコンポーネント

```typescript
// app/[locale]/dashboard/page.tsx
import { getDictionary, createTranslation } from '@/lib/i18n';
import type { Locale } from '@/types/i18n';

interface DashboardPageProps {
  params: { locale: Locale };
}

export default async function DashboardPage({ params: { locale } }: DashboardPageProps) {
  const dictionary = await getDictionary(locale);
  const t = createTranslation(dictionary);

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: 'ユーザー名' })}</p>
    </div>
  );
}

// メタデータの国際化
export async function generateMetadata({ params: { locale } }: DashboardPageProps) {
  const dictionary = await getDictionary(locale);
  const t = createTranslation(dictionary);

  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
  };
}
```

### 2. クライアントコンポーネント

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/types/i18n';

interface ClientComponentProps {
  locale: Locale;
  dictionary: Record<string, any>;
}

export function ClientComponent({ locale, dictionary }: ClientComponentProps) {
  const t = (key: string) => {
    // クライアントサイドでの翻訳ロジック
    return dictionary[key] || key;
  };

  return (
    <button onClick={() => alert(t('actions.save'))}>
      {t('actions.save')}
    </button>
  );
}

// 親コンポーネント（サーバー）から辞書を渡す
export default async function ParentPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(locale);

  return (
    <ClientComponent locale={locale} dictionary={dictionary} />
  );
}
```

### 3. 言語切り替えコンポーネント

```typescript
// components/i18n/language-switcher.tsx
'use client';

import LanguageSwitcher from '@/components/i18n/language-switcher';

// 使用例
export function Header({ locale, dictionary }) {
  return (
    <header>
      <nav>
        <LanguageSwitcher
          currentLocale={locale}
          dictionary={dictionary}
        />
      </nav>
    </header>
  );
}
```

### 4. エラーメッセージの国際化

```typescript
import { getErrorMessage, LocalizedError } from '@/lib/i18n/error-messages'

// 基本的な使用
const errorMessage = getErrorMessage('REQUIRED_FIELD', 'ja', { field: 'メールアドレス' })
console.log(errorMessage.message) // "メールアドレスは必須です"

// エラークラスの使用
try {
  throw new LocalizedError('INVALID_EMAIL', 'ja')
} catch (error) {
  const localizedMessage = error.getLocalizedMessage()
  console.log(localizedMessage.title) // "メールアドレスが無効"
}

// フォームバリデーションでの使用
const validateForm = (data: FormData, locale: Locale) => {
  const errors: string[] = []

  if (!data.email) {
    const error = getErrorMessage('REQUIRED_FIELD', locale, { field: 'Email' })
    errors.push(error.message)
  }

  return errors
}
```

## 📝 翻訳キー設計

### 命名規則

1. **階層的構造**: `<namespace>.<context>.<element>[.<variant>]`
2. **意味のあるキー名**: `auth.login.title` (○) vs `text1` (×)
3. **一貫したパターン**: 同様の要素は同じパターンで命名

### ベストプラクティス

```typescript
// ✅ 推奨
{
  "auth": {
    "login": {
      "title": "Sign In",
      "fields": {
        "email": "Email Address",
        "password": "Password"
      },
      "actions": {
        "submit": "Sign In",
        "forgot": "Forgot Password?"
      }
    }
  }
}

// ❌ 避ける
{
  "loginTitle": "Sign In",
  "email": "Email Address",
  "pwd": "Password",
  "btn1": "Sign In",
  "link1": "Forgot Password?"
}
```

### 変数補間

```typescript
// 翻訳ファイル
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} {{count, plural, one {item} other {items}}}",
  "timeLeft": "{{hours}}h {{minutes}}m remaining"
}

// 使用例
t('welcome', { name: 'Alice' })
// → "Welcome, Alice!"

t('itemCount', { count: 5 })
// → "You have 5 items"
```

## 🧪 テスト戦略

### 1. ユニットテスト

```typescript
// __tests__/i18n.test.ts
describe('Translation System', () => {
  it('基本的な翻訳が動作する', async () => {
    const dictionary = await getDictionary('ja')
    const t = createTranslation(dictionary)

    expect(t('app.name')).toBe('BoxLog')
    expect(t('actions.save')).toBe('保存')
  })

  it('変数補間が動作する', () => {
    const t = createTranslation({
      welcome: 'こんにちは、{{name}}さん',
    })

    expect(t('welcome', { name: '田中' })).toBe('こんにちは、田中さん')
  })
})
```

### 2. カバレッジテスト

```typescript
// 翻訳漏れチェック
describe('Translation Coverage', () => {
  it('英語と日本語で同じキーが存在する', async () => {
    const enDict = await getDictionary('en')
    const jaDict = await getDictionary('ja')

    const enKeys = getAllKeys(enDict)
    const jaKeys = getAllKeys(jaDict)

    expect(enKeys).toEqual(jaKeys)
  })
})
```

### 3. E2Eテスト

```typescript
// e2e/language-switching.test.ts
describe('Language Switching', () => {
  it('言語切り替えが正常に動作する', async () => {
    await page.goto('/en/dashboard')
    await page.click('[data-testid="language-switcher"]')
    await page.click('[data-value="ja"]')

    await expect(page).toHaveURL('/ja/dashboard')
    await expect(page.locator('h1')).toContainText('ダッシュボード')
  })
})
```

## 🚀 デプロイメント

### 1. ビルド時の翻訳検証

```bash
# package.json
{
  "scripts": {
    "i18n:check": "node scripts/check-translations.js",
    "i18n:validate": "node scripts/validate-keys.js",
    "pre-build": "npm run i18n:check && npm run i18n:validate"
  }
}
```

### 2. CI/CDパイプライン

```yaml
# .github/workflows/i18n-check.yml
name: I18n Validation
on: [push, pull_request]

jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Validate translations
        run: npm run i18n:validate
      - name: Run i18n tests
        run: npm run test:i18n
```

## 📊 パフォーマンス最適化

### 1. 辞書の遅延読み込み

```typescript
// 動的インポートによる最適化
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  ja: () => import('./dictionaries/ja.json').then((m) => m.default),
}

// 使用時のみ読み込み
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() || dictionaries.en()
}
```

### 2. バンドルサイズ最適化

```typescript
// Tree shakingを活用
export const getCompactDictionary = async (locale: Locale, keys: string[]) => {
  const fullDictionary = await getDictionary(locale)

  return keys.reduce((compact, key) => {
    const value = getNestedValue(fullDictionary, key)
    if (value !== key) {
      compact[key] = value
    }
    return compact
  }, {} as Dictionary)
}
```

## 🔍 デバッグとトラブルシューティング

### 1. 開発ツール

```typescript
// デバッグモードでの翻訳キー表示
const DEBUG_I18N = process.env.NODE_ENV === 'development'

const t = (key: string, variables?: Record<string, any>) => {
  const translation = getNestedValue(dictionary, key)

  if (DEBUG_I18N && translation === key) {
    console.warn(`Missing translation key: ${key}`)
  }

  return interpolate(translation, variables)
}
```

### 2. よくある問題と解決法

| 問題                       | 原因                     | 解決法                             |
| -------------------------- | ------------------------ | ---------------------------------- |
| 翻訳が表示されない         | キーが存在しない         | キーの存在確認、スペルチェック     |
| 変数補間が動かない         | 変数名の不一致           | 変数名の確認、デバッグログ追加     |
| 言語切り替えが反映されない | Cookieが保存されていない | Cookie設定の確認、ブラウザ設定確認 |
| ビルドエラー               | 辞書ファイルの形式エラー | JSON構文確認、リンターの実行       |

## 📚 リソース・参考資料

### 公式ドキュメント

- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Unicode CLDR](https://cldr.unicode.org/)

### 内部ドキュメント

- [翻訳キー設計ガイド](./I18N_TRANSLATION_KEYS_GUIDE.md)
- [エラーメッセージ管理](../api/ERROR_HANDLING.md)
- [テストガイドライン](../testing/TESTING_GUIDE.md)

### ツール・ライブラリ

- [Vitest](https://vitest.dev/) - テストフレームワーク
- [Playwright](https://playwright.dev/) - E2Eテスト
- [TypeScript](https://www.typescriptlang.org/) - 型安全性

## 🚧 今後の展開

### Phase 2予定機能

- RTL（右→左）言語対応
- 複数形処理の高度化
- 日付・時刻フォーマット地域対応
- 翻訳管理システム連携

### Phase 3予定機能

- 中国語・韓国語追加
- 自動翻訳機能
- CDN配信最適化
- A/Bテスト対応

---

このガイドラインに従って国際化を実装することで、BoxLogアプリケーションの品質と保守性を高く保ちながら、グローバル展開に対応できます。
