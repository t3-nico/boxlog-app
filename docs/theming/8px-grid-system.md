# 8px Grid System

BoxLogアプリケーションは、一貫性のある美しいUIを実現するために8pxグリッドシステムを採用しています。

## 概要

8pxグリッドシステムは、すべてのスペーシング値を8の倍数（4px、8px、12px、16px...）に統一するデザインシステムです。

## Tailwind CSSでの実装

### 基本的な対応表

| Tailwind Class | ピクセル値 | 8pxグリッド準拠 |
|----------------|-----------|----------------|
| `p-1`, `m-1`, `gap-1` | 4px | ✅ |
| `p-2`, `m-2`, `gap-2` | 8px | ✅ |
| `p-3`, `m-3`, `gap-3` | 12px | ✅ |
| `p-4`, `m-4`, `gap-4` | 16px | ✅ |
| `p-5`, `m-5`, `gap-5` | 20px | ✅ |
| `p-6`, `m-6`, `gap-6` | 24px | ✅ |
| `p-8`, `m-8`, `gap-8` | 32px | ✅ |
| `p-10`, `m-10`, `gap-10` | 40px | ✅ |
| `p-12`, `m-12`, `gap-12` | 48px | ✅ |
| `p-16`, `m-16`, `gap-16` | 64px | ✅ |

### 禁止されているクラス

以下の`.5`クラスは8pxグリッドに準拠しないため使用禁止です：

| 禁止クラス | ピクセル値 | 代替クラス |
|-----------|-----------|-----------|
| `p-0.5`, `m-0.5` | 2px | `p-1`, `m-1` (4px) |
| `p-1.5`, `m-1.5` | 6px | `p-2`, `m-2` (8px) |
| `p-2.5`, `m-2.5` | 10px | `p-3`, `m-3` (12px) |
| `p-3.5`, `m-3.5` | 14px | `p-4`, `m-4` (16px) |
| `gap-1.5` | 6px | `gap-2` (8px) |
| `gap-3.5` | 14px | `gap-4` (16px) |

## 実装ガイドライン

### ✅ 良い例

```tsx
// 8pxグリッドに準拠
<div className="p-4 m-2 gap-4">
  <button className="px-3 py-2">Button</button>
  <div className="mt-4 mb-8 space-y-4">Content</div>
</div>
```

### ❌ 悪い例

```tsx
// 8pxグリッドに準拠していない
<div className="p-2.5 m-1.5 gap-3.5">
  <button className="px-1.5 py-0.5">Button</button>
  <div className="mt-2.5 mb-3.5 space-y-1.5">Content</div>
</div>
```

## サイズクラスの変換

### Width/Height

| 禁止 | 推奨 |
|-----|-----|
| `w-0.5`, `h-0.5` | `w-2`, `h-2` |
| `w-1.5`, `h-1.5` | `w-2`, `h-2` |
| `w-2.5`, `h-2.5` | `w-3`, `h-3` |
| `w-3.5`, `h-3.5` | `w-4`, `h-4` |
| `size-3.5` | `size-4` |

## 例外

以下の場合は`.5`値の使用が許可されます：

1. **calc()式内での使用**
   ```css
   width: calc(100% - 0.5rem);
   ```

2. **アニメーション値**
   ```css
   animation-duration: 0.5s;
   ```

3. **opacity値**
   ```css
   opacity: 0.5;
   ```

4. **scale値**
   ```css
   transform: scale(0.5);
   ```

## コンポーネント別ガイド

### ボタン
```tsx
// Primary button
<Button className="px-4 py-2 text-sm">
  
// Small button  
<Button className="px-3 py-1 text-xs">

// Large button
<Button className="px-6 py-3 text-base">
```

### カード
```tsx
<Card className="p-6 space-y-4">
  <CardHeader className="pb-4">
  <CardContent className="py-4">
  <CardFooter className="pt-4">
</Card>
```

### フォーム要素
```tsx
<Input className="px-3 py-2 h-10" />
<Select className="px-3 py-2 h-10" />
<Textarea className="px-3 py-2" />
```

## 検証方法

8pxグリッドの準拠状況を確認するには：

```bash
# .5クラスの使用箇所を検索
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs grep -o "p-[0-9]*\.5\|m-[0-9]*\.5\|gap-[0-9]*\.5\|w-[0-9]*\.5\|h-[0-9]*\.5\|size-[0-9]*\.5" | wc -l
```

結果が0であれば、8pxグリッドシステムに完全準拠しています。

## メンテナンス

新しいコンポーネントを追加する際は：

1. 必ず8pxグリッドに準拠したスペーシングを使用
2. `.5`クラスを使用しない
3. デザインツールでも8pxグリッドを意識

## 関連ドキュメント

- [Theme System](./theme-system.md) - テーマシステムの詳細
- [Component Guidelines](../components/guidelines.md) - コンポーネント作成ガイドライン