# Third-Party Licenses and Credits

Dayoptプロジェクトは、以下のオープンソースソフトウェア、ライブラリ、リソースを利用しています。各プロジェクトのメンテナーと貢献者の皆様に深く感謝いたします。

---

## UI Components & Design Systems

### shadcn/ui

- **Source**: https://ui.shadcn.com/
- **License**: MIT License
- **Copyright**: shadcn
- **Description**: Radix UIとTailwind CSSで構築された美しいUIコンポーネント集
- **Used in**: ボタン、ダイアログ、入力フォーム、テーブル等、アプリケーション全体のUIコンポーネント

### shadcn-dashboard-landing-template

- **Source**: https://github.com/silicondeck/shadcn-dashboard-landing-template
- **License**: MIT License
- **Copyright**: Copyright (c) 2025 ShadcnStore
- **Description**: dashboardとlanding page用のテンプレート
- **Used in**: エラーページ（404, 401, 403, 500, maintenance）のデザイン
- **Files**:
  - `/src/app/not-found.tsx`
  - `/src/app/error.tsx`
  - `/src/app/error/401/page.tsx`
  - `/src/app/error/403/page.tsx`
  - `/src/app/error/500/page.tsx`
  - `/src/app/error/maintenance/page.tsx`

**MIT License Text**:

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Radix UI

- **Source**: https://www.radix-ui.com/
- **License**: MIT License
- **Description**: 高品質なアクセシブルUIコンポーネントライブラリ
- **Used in**: shadcn/uiのベースとして間接的に使用

### Lucide Icons

- **Source**: https://lucide.dev/
- **License**: ISC License
- **Description**: 美しいオープンソースアイコンライブラリ
- **Used in**: アプリケーション全体のアイコン表示

---

## Core Technologies

### Next.js

- **Source**: https://nextjs.org/
- **Repository**: https://github.com/vercel/next.js
- **License**: MIT License
- **Copyright**: Vercel, Inc.
- **Description**: The React Framework for Production
- **Version**: 14.x
- **Used in**: アプリケーション全体のフレームワーク

### React

- **Source**: https://react.dev/
- **Repository**: https://github.com/facebook/react
- **License**: MIT License
- **Copyright**: Meta Platforms, Inc.
- **Description**: A JavaScript library for building user interfaces
- **Version**: 18.x
- **Used in**: アプリケーション全体のUIライブラリ

### TypeScript

- **Source**: https://www.typescriptlang.org/
- **Repository**: https://github.com/microsoft/TypeScript
- **License**: Apache License 2.0
- **Copyright**: Microsoft Corporation
- **Description**: TypeScript is a superset of JavaScript that compiles to clean JavaScript output
- **Version**: 5.x
- **Used in**: アプリケーション全体の型システム

---

## Styling & Design

### Tailwind CSS

- **Source**: https://tailwindcss.com/
- **Repository**: https://github.com/tailwindlabs/tailwindcss
- **License**: MIT License
- **Copyright**: Tailwind Labs, Inc.
- **Description**: A utility-first CSS framework
- **Version**: 4.x
- **Used in**: アプリケーション全体のスタイリング

### clsx

- **Repository**: https://github.com/lukeed/clsx
- **License**: MIT License
- **Description**: A tiny utility for constructing className strings
- **Used in**: 条件付きクラス名の生成

### tailwind-merge

- **Repository**: https://github.com/dcastil/tailwind-merge
- **License**: MIT License
- **Description**: Merge Tailwind CSS classes without style conflicts
- **Used in**: Tailwindクラスのマージ

---

## Backend & Database

### Supabase

- **Source**: https://supabase.com/
- **Repository**: https://github.com/supabase/supabase
- **License**: Apache License 2.0
- **Copyright**: Supabase, Inc.
- **Description**: Open source Firebase alternative
- **Used in**: 認証、データベース、リアルタイム通信

### PostgreSQL (via Supabase)

- **Source**: https://www.postgresql.org/
- **License**: PostgreSQL License (BSD-like)
- **Description**: The World's Most Advanced Open Source Relational Database
- **Used in**: データストレージ

---

## State Management & Data Fetching

### Zustand

- **Repository**: https://github.com/pmndrs/zustand
- **License**: MIT License
- **Description**: A small, fast and scalable bearbones state-management solution
- **Used in**: グローバル状態管理

### TanStack Query (React Query)

- **Repository**: https://github.com/TanStack/query
- **License**: MIT License
- **Description**: Powerful asynchronous state management for TS/JS, React
- **Used in**: サーバーステートの管理、データフェッチング

### tRPC

- **Source**: https://trpc.io/
- **Repository**: https://github.com/trpc/trpc
- **License**: MIT License
- **Description**: End-to-end typesafe APIs
- **Used in**: クライアント・サーバー間の型安全なAPI通信

---

## Validation & Forms

### Zod

- **Source**: https://zod.dev/
- **Repository**: https://github.com/colinhacks/zod
- **License**: MIT License
- **Description**: TypeScript-first schema validation with static type inference
- **Used in**: データバリデーション、フォーム検証

### React Hook Form

- **Repository**: https://github.com/react-hook-form/react-hook-form
- **License**: MIT License
- **Description**: Performant, flexible and extensible forms with easy-to-use validation
- **Used in**: フォーム管理

---

## Internationalization (i18n)

### next-intl

- **Repository**: https://github.com/amannn/next-intl
- **License**: MIT License
- **Description**: Internationalization for Next.js
- **Used in**: 多言語対応（日本語・英語）

### date-fns

- **Repository**: https://github.com/date-fns/date-fns
- **License**: MIT License
- **Description**: Modern JavaScript date utility library
- **Used in**: 日付のフォーマット、操作

---

## Development Tools

### ESLint

- **Source**: https://eslint.org/
- **Repository**: https://github.com/eslint/eslint
- **License**: MIT License
- **Description**: Find and fix problems in your JavaScript code
- **Used in**: コード品質チェック

### Prettier

- **Repository**: https://github.com/prettier/prettier
- **License**: MIT License
- **Description**: Opinionated Code Formatter
- **Used in**: コード自動フォーマット

### Husky

- **Repository**: https://github.com/typicode/husky
- **License**: MIT License
- **Description**: Git hooks made easy
- **Used in**: Gitフック管理

### lint-staged

- **Repository**: https://github.com/okonet/lint-staged
- **License**: MIT License
- **Description**: Run linters on git staged files
- **Used in**: ステージングファイルへのlint実行

---

## Testing

### Vitest

- **Repository**: https://github.com/vitest-dev/vitest
- **License**: MIT License
- **Description**: A blazing fast unit test framework powered by Vite
- **Used in**: ユニットテスト、統合テスト

### Testing Library

- **Repository**: https://github.com/testing-library/react-testing-library
- **License**: MIT License
- **Description**: Simple and complete React DOM testing utilities
- **Used in**: Reactコンポーネントのテスト

---

## Utilities

### nanoid

- **Repository**: https://github.com/ai/nanoid
- **License**: MIT License
- **Description**: A tiny, secure, URL-friendly, unique string ID generator
- **Used in**: 一意なID生成

### lodash

- **Repository**: https://github.com/lodash/lodash
- **License**: MIT License
- **Description**: A modern JavaScript utility library
- **Used in**: 配列・オブジェクト操作

---

## Fonts

### Google Fonts (Geist)

- **Source**: https://fonts.google.com/
- **License**: SIL Open Font License 1.1
- **Description**: Geist フォントファミリー
- **Used in**: アプリケーション全体のフォント
- **Delivery**: CDN経由（セルフホストなし）

---

## Images & Icons

### Placeholder Images

- **Source**: https://ui.shadcn.com/placeholder.svg
- **License**: MIT License (shadcn/ui)
- **Used in**: エラーページのプレースホルダー画像

---

## Full License Texts

### MIT License (Most Libraries)

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Apache License 2.0 (TypeScript, Supabase)

```
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.
...
(Full text available at: http://www.apache.org/licenses/LICENSE-2.0)
```

### ISC License (Lucide Icons)

```
ISC License

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## Automated License Generation

完全なライセンス情報の自動生成については、以下を実行してください：

```bash
# 依存ライブラリのライセンス情報を生成
npm run generate-licenses

# 生成されたファイル
# - public/oss-credits.json
# - public/THIRD_PARTY_NOTICES.txt
```

詳細は [LICENSE_COMPLIANCE_PLAN.md](./legal/LICENSE_COMPLIANCE_PLAN.md) を参照してください。

---

## Notes

- 本ドキュメントは主要な依存関係のみを記載しています
- 完全なリストは `package.json` と自動生成される `public/oss-credits.json` を参照してください
- ライセンス情報は各プロジェクトの最新版を確認することをお勧めします

---

**最終更新**: 2025-10-14
**管理**: Dayopt Development Team
