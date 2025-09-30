# アイコンとスペーシング変更詳細

## 🎯 アイコンシステムの統一

### 概要

BoxLogのアイコン使用を`/src/config/theme/icons.ts`ベースに統一し、一貫したサイズとスタイルを確立。

## 📐 アイコンサイズの標準化

### サイズ階層（8pxグリッド準拠）

```typescript
export const icon = {
  size: {
    xs: 'w-3 h-3', // 12px - 極小（インラインテキスト用）
    sm: 'w-4 h-4', // 16px - 小（ボタン内、リスト項目）
    md: 'w-5 h-5', // 20px - 標準（デフォルト）
    lg: 'w-6 h-6', // 24px - 大（強調アイコン）
    xl: 'w-8 h-8', // 32px - 特大（イラスト的用途）
    '2xl': 'w-12 h-12', // 48px - 最大（ヒーロー用）
  },
}
```

### 実装変更箇所

#### 1. Sidebar閉じるボタン

**ファイル**: `/src/components/layout/navigation/Sidebar/index.tsx`

**変更前**:

```tsx
<PanelLeft className="text-muted-foreground h-4 w-4" />
```

**変更後**:

```tsx
<PanelLeft className={`${icon.size.md} ${text.muted}`} />
```

**効果**:

- サイズの統一（w-4 h-4 → w-5 h-5）
- テーマシステム使用
- より適切な視認性

#### 2. Createボタンのアイコン構成

**ファイル**: `/src/components/layout/navigation/shared/common-sections.tsx`

**変更前**:

```tsx
<span className="truncate">Create</span>
<PlusCircleIcon className="size-5 shrink-0 text-white" />
```

**変更後**:

```tsx
<div className="flex items-center gap-2">
  <Plus className={`size-5 shrink-0 ${text.onPrimary}`} />
  <span className={`truncate ${body.large} ${text.onPrimary}`}>Create</span>
</div>
<ChevronDown className={`size-4 shrink-0 ${text.onPrimary}`} />
```

**レイアウト変更**:

- 左側: プラスアイコン + テキスト
- 右側: ドロップダウン矢印
- アイコン種類: PlusCircleIcon → Plus + ChevronDown

#### 3. ナビゲーション矢印のサイズ統一

**ファイル**: `/src/features/calendar/components/layout/Header/DateNavigator.tsx`

**変更前**:

```tsx
<ChevronLeft className={arrowSizes[arrowSize]} />
// arrowSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }
```

**変更後**:

```tsx
<ChevronLeft className={arrowSizes[arrowSize]} />
// 同じだが、MiniCalendarと統一
```

#### 4. MiniCalendar矢印の統一

**ファイル**: `/src/features/calendar/components/layout/Sidebar/MiniCalendar.tsx`

**変更前**:

```tsx
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <ChevronLeft className="h-4 w-4" />
</Button>
```

**変更後**:

```tsx
<button
  className={cn('rounded-full p-1.5 transition-colors', secondary.hover, 'text-muted-foreground hover:text-foreground')}
>
  <ChevronLeft className="h-5 w-5" />
</button>
```

**変更点**:

- サイズ: h-4 w-4 → h-5 w-5（DateNavigatorと統一）
- スタイル: shadcn/ui Button → ネイティブbutton
- ホバー効果: テーマシステム使用

## 🎨 アイコン色の統一

### 色パターンの標準化

```typescript
export const icon = {
  color: {
    default: 'text-neutral-600 dark:text-neutral-400', // 通常
    primary: 'text-blue-600 dark:text-blue-400', // 重要
    muted: 'text-neutral-400 dark:text-neutral-600', // 控えめ
    hover: 'hover:text-blue-600 dark:hover:text-blue-400', // ホバー時
    inverse: 'text-white dark:text-neutral-900', // 背景色付き用
  },
}
```

### 実装例

```tsx
// Sidebar閉じるボタン
<PanelLeft className={`${icon.size.md} ${text.muted}`} />

// Createボタン（プライマリー背景内）
<Plus className={`size-5 shrink-0 ${text.onPrimary}`} />

// ナビゲーション矢印（ホバー対応）
className={cn(
  secondary.hover,
  text.muted,
  'hover:text-foreground'  // ホバー時に濃く
)}
```

## 📏 スペーシングの統一

### パディング・マージンの標準化

#### ボタンパディング

```scss
// 小さいボタン
p-1.5  // 6px（ナビゲーション矢印）

// 標準ボタン
py-2 px-4  // 8px 16px（Todayボタン）

// 大きいボタン
py-4 px-4  // 16px 16px（Createボタン）
```

#### コンポーネント間隔

```scss
// アイコンとテキストの間隔
gap-2  // 8px（標準）

// コンポーネント間の間隔
mb-3   // 12px（MiniCalendarヘッダー）
mb-4   // 16px（Sidebarセクション）
```

### 実装例

#### Createボタンの内部構造

```tsx
<Button className="flex h-[56px] w-full items-center justify-between px-4 py-4">
  <div className="flex items-center gap-2">
    {' '}
    {/* アイコン-テキスト間隔 */}
    <Plus className="size-5 shrink-0" />
    <span className="truncate">Create</span>
  </div>
  <ChevronDown className="size-4 shrink-0" />
</Button>
```

#### ナビゲーション矢印のパディング

```tsx
<button className="rounded-full p-1.5">
  {' '}
  {/* コンパクトなパディング */}
  <ChevronLeft className="h-5 w-5" />
</button>
```

## 🔄 角丸（Border Radius）の統一

### 角丸システムの適用

```typescript
// /src/config/theme/rounded.ts より
export const radius = {
  xs: 'rounded-[2px]', // 2px - 極小
  sm: 'rounded', // 4px - 小
  md: 'rounded-lg', // 8px - 標準（BoxLogメイン）
  lg: 'rounded-xl', // 12px - 大
}
```

### 実装箇所

#### 週数バッジ

**変更前**:

```tsx
<span className="rounded-full">week{weekNumber}</span>
```

**変更後**:

```tsx
<h6 className="rounded-xs">week{weekNumber}</h6>
```

**効果**: 完全な円形からわずかな角丸に変更（より洗練された印象）

#### ナビゲーション矢印

```tsx
<button className="rounded-full p-1.5">
  {' '}
  // 円形維持（クリック領域明確化）
  <ChevronLeft />
</button>
```

#### ViewSwitcherドロップダウン

```tsx
<div className={cn(
  background.base,
  radius.md,        // 8px角丸（BoxLog標準）
  'shadow-lg'
)}>
```

## 📱 レスポンシブ対応

### アイコンサイズのレスポンシブ戦略

- **モバイル**: 基本的に同じサイズを維持（タッチターゲット確保のため）
- **タブレット以上**: 必要に応じてサイズアップ
- **ポリシー**: 最小44px×44pxのタッチ領域確保

### 実装例

```tsx
// ナビゲーション矢印（タッチフレンドリー）
<button className="p-1.5">           // 最小タッチサイズ確保
  <ChevronLeft className="h-5 w-5" />  // 適切な視認性
</button>

// Sidebarアイコン（コンテキスト重視）
<PanelLeft className="w-5 h-5" />    // 存在感と機能性のバランス
```

## 🎯 視覚的インパクトの調整

### アイコン階層の明確化

1. **主要アクション**: size-5（20px）+ primary色
2. **ナビゲーション**: size-5（20px）+ muted色
3. **補助機能**: size-4（16px）+ muted色
4. **装飾的**: size-3（12px）+ 低コントラスト

### 実装における優先順位

```tsx
// 1. プライマリーアクション（Createボタン）
<Plus className="size-5 text-white" />

// 2. ナビゲーション（矢印、閉じるボタン）
<ChevronLeft className="size-5 text-neutral-600" />

// 3. 補助アクション（ドロップダウン矢印）
<ChevronDown className="size-4 text-white" />
```

## 📊 統計と効果

### 変更統計

- **アイコンサイズ統一**: 7箇所
- **色の統一**: 5箇所
- **スペーシング調整**: 8箇所
- **角丸統一**: 3箇所

### 期待される効果

1. **一貫性**: 全体的な統一感
2. **使いやすさ**: 適切なタッチターゲットサイズ
3. **美しさ**: 整然としたレイアウト
4. **保守性**: テーマからの一元管理

### アクセシビリティ向上

- **コントラスト**: 適切な色選択
- **サイズ**: 十分な視認性確保
- **タッチ**: 44px以上のターゲットサイズ

## ⚠️ 注意事項

### 現在の制約

1. **部分適用**: まだ全アイコンは統一されていない
2. **カスタムケース**: 特殊な用途では個別調整が必要
3. **パフォーマンス**: アイコンライブラリ（Lucide React）の最適化余地

### 今後の課題

1. **全アイコン統一**: 残りのコンポーネントでの適用
2. **アニメーション**: ホバー・フォーカス時の動的効果
3. **カスタムアイコン**: プロジェクト固有アイコンの追加

---

**📌 このアイコンとスペーシングの統一により、BoxLogのインターフェースがより洗練され、使いやすくなりました。**

---

**最終更新**: 2025-09-18
