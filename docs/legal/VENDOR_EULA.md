# ベンダー独自 EULA・ライセンス管理

BoxLog で使用している UI ライブラリ・フォント・アイコンのライセンス情報と帰属表示要件をまとめたドキュメントです。

**最終更新**: 2025-10-28
**対象バージョン**: v0.2.1

---

## 📋 サマリー

| カテゴリ          | ライブラリ/ベンダー                 | ライセンス | 帰属表示義務 | UI表示要否 | 商用利用 |
| ----------------- | ----------------------------------- | ---------- | ------------ | ---------- | -------- |
| **UI Components** | shadcn/ui                           | MIT        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **UI Primitives** | Radix UI                            | MIT        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **Icons**         | Lucide Icons                        | ISC        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **Headless UI**   | Headless UI                         | MIT        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **Theming**       | next-themes                         | MIT        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **Utilities**     | tailwind-merge, tailwindcss-animate | MIT        | ✅ あり      | ❌ 不要    | ✅ 可    |
| **Fonts**         | Inter (Google Fonts)                | OFL-1.1    | ✅ あり      | ❌ 不要    | ✅ 可    |

**結論**: すべてのベンダーが **商用利用を許可**。ソースコード内での帰属表示（LICENSE ファイル同梱）のみで、**UI 上での表示は不要**。

---

## 🎨 UI ライブラリ

### 1. shadcn/ui

**ライセンス**: MIT License
**Copyright**: © 2023 shadcn
**リポジトリ**: https://github.com/shadcn-ui/ui

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での「Powered by shadcn/ui」等の表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集（該当なし: shadcn/ui は npm パッケージではなくコピペベース）
- ✅ `public/THIRD_PARTY_NOTICES.txt` で明示的に記載
- ✅ 本ドキュメントで管理

#### 商用利用

✅ **許可**: 制限なく使用、複製、修正、配布、サブライセンス、販売が可能

#### 特記事項

- shadcn/ui は **npm パッケージではなくコピペベースのコンポーネントライブラリ**
- 各コンポーネントは `src/components/ui/` にコピー後、プロジェクト固有のコードとして管理
- 基盤として Radix UI を使用（Radix UI のライセンスも準拠）

---

### 2. Radix UI

**ライセンス**: MIT License
**Copyright**: © WorkOS (Radix UI creators)
**リポジトリ**: https://github.com/radix-ui/primitives

#### 使用パッケージ（一部抜粋）

```
@radix-ui/react-alert-dialog@1.1.15: MIT
@radix-ui/react-avatar@1.1.10: MIT
@radix-ui/react-checkbox@1.3.3: MIT
@radix-ui/react-dialog@1.1.15: MIT
@radix-ui/react-dropdown-menu@2.1.16: MIT
@radix-ui/react-popover@1.1.15: MIT
@radix-ui/react-select@2.2.6: MIT
@radix-ui/react-tooltip@1.2.8: MIT
... 他 30+ パッケージ
```

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集
- ✅ `npm run generate-licenses` で自動更新
- ✅ `/legal/oss-credits` ページで公開中

#### 商用利用

✅ **許可**: 制限なく商用利用可能

---

### 3. Lucide Icons

**ライセンス**: ISC License
**パッケージ**: `lucide-react@0.542.0`, `lucide-react@0.546.0`
**リポジトリ**: https://github.com/lucide-icons/lucide

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集
- ✅ `/legal/oss-credits` ページで公開中

#### 商用利用

✅ **許可**: ISC License は MIT License とほぼ同等（制限なし）

---

### 4. Headless UI

**ライセンス**: MIT License
**パッケージ**: `@headlessui/react@2.2.9`
**リポジトリ**: https://github.com/tailwindlabs/headlessui

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集
- ✅ `/legal/oss-credits` ページで公開中

#### 商用利用

✅ **許可**: 制限なく商用利用可能

---

### 5. next-themes

**ライセンス**: MIT License
**パッケージ**: `next-themes@0.4.6`
**リポジトリ**: https://github.com/pacocoursey/next-themes

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集
- ✅ `/legal/oss-credits` ページで公開中

#### 商用利用

✅ **許可**: 制限なく商用利用可能

---

### 6. Tailwind CSS Utilities

**ライセンス**: MIT License
**パッケージ**:

- `tailwind-merge@3.3.1`
- `tailwindcss-animate@1.0.7`

#### 帰属表示要件

✅ **必須**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示

#### 実装状況

- ✅ `public/oss-credits.json` で自動収集
- ✅ `/legal/oss-credits` ページで公開中

#### 商用利用

✅ **許可**: 制限なく商用利用可能

---

## 🔤 フォント

### Inter (Google Fonts)

**ライセンス**: SIL Open Font License 1.1 (OFL-1.1)
**提供元**: Google Fonts
**リポジトリ**: https://github.com/rsms/inter

#### 使用方法

```typescript
// src/app/layout.tsx:7
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

#### 帰属表示要件

✅ **必須（CDN 利用時）**: ソースコード内に著作権表示とライセンス条文を含める
❌ **不要**: UI 上での表示（Google Fonts CDN がホスト）

#### 実装状況

- ✅ `next/font/google` 経由で Google Fonts CDN から配信
- ✅ 本ドキュメントで管理
- ❌ `public/oss-credits.json` には含まれない（npm パッケージではないため）

#### 商用利用

✅ **許可**: OFL-1.1 は商用利用を完全に許可

#### 特記事項

- **Google Fonts CDN を使用**: フォントファイルは Google がホストしており、セルフホストではない
- **UI 表示不要**: CDN 利用時は、ソースコード内のライセンス明記のみで OK
- **セルフホスト時**: フォントファイルとともに LICENSE ファイルを同梱する必要がある

---

## ✅ コンプライアンス確認

### 帰属表示の実装状況

| 要件                               | 実装方法                                      | ファイル                          | 状況        |
| ---------------------------------- | --------------------------------------------- | --------------------------------- | ----------- |
| **npm パッケージの自動収集**       | `scripts/generate-licenses.ts`                | `public/oss-credits.json`         | ✅ 実装済み |
| **Web ページでの公開**             | Server Component                              | `app/[locale]/legal/oss-credits/` | ✅ 実装済み |
| **Apache-2.0 NOTICE ファイル集約** | `scripts/generate-licenses.ts`                | `public/THIRD_PARTY_NOTICES.txt`  | ✅ 実装済み |
| **shadcn/ui 帰属表示**             | 本ドキュメント                                | `docs/legal/VENDOR_EULA.md`       | ✅ 実装済み |
| **Google Fonts (Inter) 帰属表示**  | 本ドキュメント                                | `docs/legal/VENDOR_EULA.md`       | ✅ 実装済み |
| **pre-commit ライセンスチェック**  | `.husky/pre-commit`                           | -                                 | ✅ 実装済み |
| **CI/CD ライセンスチェック**       | `.github/workflows/license-check.yml`         | -                                 | ✅ 実装済み |
| **月次ライセンス監視**             | `.github/workflows/license-audit-monthly.yml` | -                                 | ✅ 実装済み |

### UI 上での表示義務

| ライブラリ/ベンダー  | UI 表示要否 | 理由                                      |
| -------------------- | ----------- | ----------------------------------------- |
| shadcn/ui            | ❌ 不要     | MIT License - ソースコード内表示のみで OK |
| Radix UI             | ❌ 不要     | MIT License - ソースコード内表示のみで OK |
| Lucide Icons         | ❌ 不要     | ISC License - ソースコード内表示のみで OK |
| Headless UI          | ❌ 不要     | MIT License - ソースコード内表示のみで OK |
| next-themes          | ❌ 不要     | MIT License - ソースコード内表示のみで OK |
| Tailwind Utilities   | ❌ 不要     | MIT License - ソースコード内表示のみで OK |
| Google Fonts (Inter) | ❌ 不要     | OFL-1.1 - CDN 利用時は UI 表示不要        |

**結論**: フッターやアバウトページでの「Powered by XXX」表示は**法的に不要**。

---

## 🔗 関連ドキュメント

- **OSS ライセンス一覧**: [`/legal/oss-credits`](../../src/app/[locale]/legal/oss-credits/page.tsx)
- **ライセンスコンプライアンス計画**: [`LICENSE_COMPLIANCE_PLAN.md`](./LICENSE_COMPLIANCE_PLAN.md)
- **THIRD_PARTY_NOTICES.txt**: [`/public/THIRD_PARTY_NOTICES.txt`](../../public/THIRD_PARTY_NOTICES.txt)
- **Issue #629**: License管理の自動化とWeb公開

---

## 📝 メンテナンス手順

### 新しい UI ライブラリを追加する場合

1. **ライセンス確認**

   ```bash
   npm run license:check-risks
   ```

2. **本ドキュメントに追記**
   - ライセンス種別
   - 帰属表示要件
   - 商用利用可否
   - UI 表示義務

3. **自動収集の確認**

   ```bash
   npm run generate-licenses
   cat public/oss-credits.json | jq '.[] | select(.name | contains("新規ライブラリ名"))'
   ```

4. **Web ページで確認**
   - http://localhost:3000/legal/oss-credits で表示確認

### フォントを変更する場合

1. **ライセンス確認**
   - Google Fonts: https://fonts.google.com/license
   - セルフホスト: フォントファイルの LICENSE ファイルを確認

2. **本ドキュメントを更新**
   - フォント名、ライセンス、提供元を記載

3. **セルフホストの場合**
   ```bash
   # フォントファイルとともに LICENSE を配置
   public/fonts/
   ├── inter.woff2
   └── LICENSE.txt
   ```

---

**📖 作成日**: 2025-10-28
**バージョン**: v1.0
**ステータス**: ✅ 完了
