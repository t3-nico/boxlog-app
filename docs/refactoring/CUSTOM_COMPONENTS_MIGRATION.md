# src/components/custom リファクタリング完了レポート

**実施日**: 2025-10-06
**関連Issue**: [#412](https://github.com/t3-nico/boxlog-app/issues/412)
**目的**: `src/components/custom` ディレクトリの完全削除とshadcn/ui・ネイティブHTML要素への統一

---

## 📋 実施概要

`src/components/custom` ディレクトリに存在していた8個のカスタムコンポーネントを調査し、以下の方針で整理しました：

- **削除**: 5個のコンポーネント（shadcn/uiまたはネイティブHTML要素で置き換え）
- **移動**: 2個のコンポーネント（有用なため `src/components/ui` に移動）
- **ディレクトリ削除**: `src/components/custom` を完全削除

---

## 🗑️ 削除したコンポーネント（5個）

### 1. Text/Strong/Code (Issue #413)
- **置き換え**: ネイティブ `<p>` タグ + Tailwind CSS
- **影響ファイル**: 1ファイル
- **コミット**: `691a695`

```tsx
// Before
<Text>Your password has been updated.</Text>

// After
<p className="text-base text-neutral-800 dark:text-neutral-200 sm:text-sm">
  Your password has been updated.
</p>
```

### 2. GoogleIcon/AppleIcon (Issue #414)
- **置き換え**: インラインSVG定義
- **影響ファイル**: 1ファイル (`LoginForm.tsx`)
- **コミット**: `ebde8a9`

```tsx
// Before
import { GoogleIcon, AppleIcon } from '@/components/custom'

// After
const GoogleIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5" {...props}>
    {/* SVG path */}
  </svg>
)
```

### 3. Listbox (Issue #415)
- **置き換え**: shadcn/ui `Select` コンポーネント
- **影響ファイル**: 1ファイル (`settings/address.tsx`)
- **コミット**: `301ee65`

```tsx
// Before
<Listbox aria-label="Region" name="region">
  <ListboxOption value="Ontario">Ontario</ListboxOption>
</Listbox>

// After
<Select value={region} onValueChange={setRegion}>
  <SelectTrigger aria-label="Region">
    <SelectValue placeholder="Region" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Ontario">Ontario</SelectItem>
  </SelectContent>
</Select>
```

### 4. DescriptionList (Issue #417)
- **置き換え**: ネイティブ `<dl>`, `<dt>`, `<dd>` + Tailwind CSS
- **影響ファイル**: 1ファイル (`stats/[id]/page.tsx`)
- **コミット**: `de8ef66`

```tsx
// Before
<DescriptionList>
  <DescriptionTerm>Customer</DescriptionTerm>
  <DescriptionDetails>{review.customer.name}</DescriptionDetails>
</DescriptionList>

// After
<dl className="grid grid-cols-1 text-base sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm">
  <dt className="col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 first:border-none sm:py-3">
    Customer
  </dt>
  <dd className="pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3">
    {review.customer.name}
  </dd>
</dl>
```

### 5. Link (Issue #419)
- **置き換え**: Next.js `next/link`
- **影響ファイル**: 2ファイル
- **コミット**: `b63ec3d`

```tsx
// Before
import { Link } from '@/components/custom'
<Link href="/review">Reviews</Link>

// After
import NextLink from 'next/link'
<NextLink href="/review">Reviews</NextLink>
```

---

## 📦 移動したコンポーネント（2個）

以下のコンポーネントは有用なため削除せず、`src/components/ui` に移動しました。

### 1. heading.tsx
**理由**: レベル別の一貫したタイポグラフィを提供する有用な抽象化

- `Heading` - h1〜h6タグの統一されたスタイリング
- `Subheading` - サブ見出し用の統一スタイル
- **使用箇所**: 20ファイル

```tsx
export const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1: return 'text-4xl font-bold tracking-tight'
      case 2: return 'text-3xl font-bold tracking-tight'
      // ...
    }
  }

  return (
    <Element
      {...props}
      className={cn(className, getHeadingClass(level), 'text-neutral-900 dark:text-neutral-100')}
    />
  )
}
```

### 2. fieldset.tsx
**理由**: HeadlessUIベースのアクセシブルなフォームコンポーネント

- `Fieldset`, `Field`, `FieldGroup`, `Label`, `Description`, `ErrorMessage`, `Legend`
- ARIA属性の自動処理
- **使用箇所**: 2ファイル

```tsx
export const Field = ({ className, ...props }: Omit<Headless.FieldProps, 'as' | 'className'>) => {
  return (
    <Headless.Field
      {...props}
      className={clsx(
        className,
        '[&>[data-slot=label]+[data-slot=control]]:mt-3',
        // ...
      )}
    />
  )
}
```

---

## 🔄 インポートパスの更新

**対象**: 20ファイル
**変更内容**: `@/components/custom` → `@/components/ui`

一括置換コマンド:
```bash
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '@/components/custom'|from '@/components/ui'|g" {} \;
```

---

## ❌ スキップしたIssue（理由付き）

### Issue #416: Heading → HTML+Tailwind
**判断**: Headingは有用なコンポーネントであり削除不要
- 20ファイルで使用中
- 一貫したタイポグラフィを提供
- ダークモード対応

### Issue #418: Fieldset 整理
**判断**: Fieldsetは有用なコンポーネントであり削除不要
- HeadlessUIベースのアクセシブルなフォームコンポーネント
- ARIA属性の自動処理

---

## 📊 最終結果

| 項目 | 詳細 |
|------|------|
| **削除したファイル** | 5個 (text.tsx, icons.tsx, listbox.tsx, description-list.tsx, link.tsx) |
| **移動したファイル** | 2個 (heading.tsx, fieldset.tsx) |
| **影響を受けたファイル** | 20ファイル（インポートパス更新） |
| **作成したIssue** | 9個 (#412-#420) |
| **クローズしたIssue** | 9個 |
| **コミット数** | 7個 |
| **lint結果** | ✅ エラーなし（警告20件は既存） |
| **typecheck結果** | ✅ カスタムコンポーネント関連エラーなし |

---

## 🎯 コミット履歴

1. `691a695` - Text/Strong/Code削除 (#413)
2. `ebde8a9` - GoogleIcon/AppleIcon削除 (#414)
3. `301ee65` - Listbox→Select置き換え (#415)
4. `de8ef66` - DescriptionList→dl/dt/dd置き換え (#417)
5. `b63ec3d` - Link→next/link置き換え (#419)
6. `5776826` - 空ファイル削除 (#420)
7. `37ff74e` - **customディレクトリ完全削除** ✨

---

## 📚 学んだこと

### 1. コンポーネント評価基準
- **削除すべき**: 単なるラッパーで実質的な価値がないもの
- **保持すべき**: 一貫性、アクセシビリティ、DX向上をもたらすもの

### 2. リファクタリング戦略
- 小さな単位でIssue化し、段階的に進める
- 各段階でlint/typecheckを実行して品質を担保
- コミットメッセージにIssue番号を含める

### 3. shadcn/ui活用
- `Select`: HeadlessUI Listboxの代替
- ネイティブHTML + Tailwind: シンプルなコンポーネントの代替

---

## ✅ 今後の推奨事項

1. **新規コンポーネント作成時**
   - まずshadcn/uiに該当コンポーネントがないか確認
   - 必要最小限の抽象化のみ行う
   - `src/components/ui` に配置

2. **既存コンポーネント見直し**
   - 定期的に使用状況を確認
   - 未使用・重複コンポーネントを削除

3. **ドキュメント整備**
   - コンポーネントの使用目的を明確化
   - 移行ガイドを残す

---

**完了日**: 2025-10-06
**レビュー担当**: Claude Code
**ステータス**: ✅ 完了
