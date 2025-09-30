# Tailwind公式準拠 移行ガイド

BoxLogのテーマシステムからTailwind CSS標準への移行ガイド。

## 🎯 移行の背景

Issue #376に基づき、独自テーマシステムからTailwind CSS公式準拠のアプローチに移行しました。

### 変更理由

1. **学習コスト削減**: Tailwind公式ドキュメントをそのまま活用可能
2. **保守性向上**: 標準的なアプローチで開発者onboarding容易化
3. **VSCode補完**: Tailwind IntelliSenseが完全動作
4. **型安全性維持**: `cn()`ユーティリティで型安全なクラス結合

## ✅ 移行完了状況

### Phase 1-3: 完了
- ✅ `cn()`ユーティリティ確認（既存）
- ✅ 必要パッケージ確認（clsx, tailwind-merge）
- ✅ Prettier設定（Tailwindクラス自動整列）
- ✅ globals.css カスタマイズ（@theme ディレクティブ）
- ✅ 全shadcn-uiコンポーネント移行（16個）

### Phase 4: 段階的対応中
- ⚠️ 古い`@/config/theme`参照: 95箇所残存
- ✅ 新規コンポーネント: Tailwind直接使用を推奨
- 🔄 既存コンポーネント: 段階的移行

## 📝 移行方法

### 旧方式（非推奨）

```tsx
import { colors, typography, spacing } from '@/config/theme'

<div className={colors.background.card}>
  <h2 className={typography.heading.h2}>タイトル</h2>
  <p className={`${colors.text.secondary} ${spacing.component.md}`}>説明</p>
</div>
```

### 新方式（推奨）

```tsx
import { cn } from '@/lib/utils'

<div className={cn('bg-white dark:bg-neutral-800')}>
  <h2 className={cn('text-2xl font-semibold')}>タイトル</h2>
  <p className={cn('text-neutral-800 dark:text-neutral-200 p-6')}>説明</p>
</div>
```

## 🎨 デザイントークン対応表

### 背景色

| 旧 | 新 |
|---|---|
| `colors.background.base` | `bg-neutral-100 dark:bg-neutral-900` |
| `colors.background.card` | `bg-white dark:bg-neutral-800` |
| `colors.background.elevated` | `bg-neutral-300 dark:bg-neutral-700` |
| `colors.background.subtle` | `bg-neutral-50 dark:bg-neutral-950` |

### テキスト色

| 旧 | 新 |
|---|---|
| `colors.text.primary` | `text-neutral-900 dark:text-neutral-100` |
| `colors.text.secondary` | `text-neutral-800 dark:text-neutral-200` |
| `colors.text.muted` | `text-neutral-600 dark:text-neutral-400` |
| `colors.text.disabled` | `text-neutral-500 dark:text-neutral-500` |

### プライマリーカラー

| 旧 | 新 |
|---|---|
| `colors.primary.DEFAULT` | `bg-blue-600 dark:bg-blue-500` |
| `colors.primary.hover` | `hover:bg-blue-700 dark:hover:bg-blue-600` |
| `colors.primary.text` | `text-white` |

### スペーシング

| 旧 | 新 |
|---|---|
| `spacing.component.sm` | `p-2` (8px) |
| `spacing.component.md` | `p-4` (16px) |
| `spacing.component.lg` | `p-6` (24px) |
| `spacing.component.xl` | `p-8` (32px) |

### タイポグラフィ

| 旧 | 新 |
|---|---|
| `typography.heading.h1` | `text-4xl font-bold tracking-tight` |
| `typography.heading.h2` | `text-3xl font-bold tracking-tight` |
| `typography.heading.h3` | `text-2xl font-semibold` |
| `typography.body.base` | `text-base leading-normal` |
| `typography.body.sm` | `text-sm leading-normal` |

## 🔧 カスタムトークン（globals.css）

Tailwind v4の`@theme`ディレクティブで独自トークンを定義：

```css
@theme {
  --color-primary-600: #2563eb;
  --color-neutral-100: #f5f5f5;
  --spacing-md: 1.5rem;
  /* ... */
}
```

## 📋 移行チェックリスト

新規コンポーネント作成時:

- [ ] `@/config/theme`からのインポートを削除
- [ ] `cn()`ユーティリティをインポート
- [ ] Tailwindクラスを直接使用
- [ ] ダークモード対応（`dark:`プレフィックス）
- [ ] レスポンシブ対応（`md:`, `lg:`等）

既存コンポーネント修正時:

- [ ] 可能な範囲で新方式に移行
- [ ] 無理に全変更しない（段階的対応）
- [ ] テーマインポートを残す場合は`@deprecated`認識

## 🚀 ベストプラクティス

### 1. cn()で条件付きクラス

```tsx
<div className={cn(
  'rounded-md border p-4',
  isActive && 'bg-blue-50 dark:bg-blue-950',
  isError && 'border-red-600',
  className // プロップで上書き可能
)}>
```

### 2. 複雑なスタイルは分割

```tsx
const baseStyles = 'flex items-center gap-2 rounded-md'
const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-neutral-300 text-neutral-900 hover:bg-neutral-400',
}

<button className={cn(baseStyles, variantStyles[variant])}>
```

### 3. デザイントークン活用

```tsx
// globals.cssで定義したカスタムトークンを使用可能
<div className="bg-primary-600 text-neutral-100">
```

## 📖 参考リソース

- **Tailwind CSS公式**: https://tailwindcss.com/docs
- **Tailwind v4移行ガイド**: https://tailwindcss.com/docs/v4-beta
- **shadcn/ui**: https://ui.shadcn.com/
- **clsx**: https://github.com/lukeed/clsx
- **tailwind-merge**: https://github.com/dcastil/tailwind-merge

## 🔄 今後の方針

1. **新規開発**: 必ず新方式（Tailwind直接使用）
2. **既存修正**: 触る際に可能な範囲で移行
3. **大規模リファクタ**: 不要（段階的移行で十分）
4. **src/config/theme**: 非推奨マーク付きで保持（削除しない）

---

**📅 最終更新**: 2025-10-01
**🎯 対応Issue**: #376
