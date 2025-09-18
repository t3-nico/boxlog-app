# コンポーネント別デザインシステム適用詳細

## 📋 修正コンポーネント一覧と変更内容

### 1. 🏠 サイドバー関連

#### `/src/components/layout/navigation/Sidebar/index.tsx`

**変更内容**:

- ヘッダータイトルのタイポグラフィ統一
- 閉じるボタンのアイコンサイズとホバー効果統一

**修正前**:

```tsx
<h1 className="text-xl font-semibold text-foreground">
  {title}
</h1>
<button className="p-1 rounded-md hover:bg-accent/50 transition-colors">
  <PanelLeft className="w-4 h-4 text-muted-foreground" />
</button>
```

**修正後**:

```tsx
<h1 className={heading.h1}>
  {title}
</h1>
<button className={`p-1 rounded-md transition-colors ${secondary.hover}`}>
  <PanelLeft className={`${icon.size.md} ${text.muted}`} />
</button>
```

#### `/src/components/layout/navigation/shared/common-sections.tsx`

**変更内容**:

- Createボタンのレイアウト構造変更（左：アイコン+テキスト、右：矢印）
- テーマシステム完全適用

**修正前**:

```tsx
<Button className="h-[56px] w-full bg-blue-600 hover:bg-blue-700">
  <span className="truncate">Create</span>
  <PlusCircleIcon className="size-5" />
</Button>
```

**修正後**:

```tsx
<Button className={`h-[56px] w-full ${primary.DEFAULT} ${primary.hover}`}>
  <div className="flex items-center gap-2">
    <Plus className={`size-5 shrink-0 ${text.onPrimary}`} />
    <span className={`truncate ${body.large} ${text.onPrimary}`}>Create</span>
  </div>
  <ChevronDown className={`size-4 shrink-0 ${text.onPrimary}`} />
</Button>
```

### 2. 📅 カレンダー関連

#### `/src/features/calendar/components/layout/Sidebar/MiniCalendar.tsx`

**変更内容**:

- 月変更矢印ボタンの統一（shadcn/ui Button → ネイティブbutton）
- 当日ハイライトの色修正
- ホバー・選択状態の条件分岐最適化

**修正前**:

```tsx
;<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <ChevronLeft className="h-4 w-4" />
</Button>

// 当日ハイライト
isToday && 'bg-blue-600/20 dark:bg-blue-400/20 text-blue-600'
```

**修正後**:

```tsx
;<button
  className={cn('rounded-full p-1.5 transition-colors', secondary.hover, 'text-muted-foreground hover:text-foreground')}
>
  <ChevronLeft className="h-5 w-5" />
</button>

// 当日ハイライト
isToday && [`!${secondary.today}`, secondary.text, 'font-semibold']
```

#### `/src/features/calendar/components/views/shared/header/DateHeader/DateHeader.tsx`

**変更内容**:

- 当日ハイライトを数字のみに限定（円形背景）
- テーマシステム使用

**修正前**:

```tsx
<div className="text-center">
  <h1 className="text-xl font-semibold">
    <div className={today && 'bg-primary text-primary-foreground rounded-full'}>{dateString}</div>
  </h1>
</div>
```

**修正後**:

```tsx
<div className="px-1 py-2 text-center transition-colors">
  <h2 className={heading.h2}>{formattedDate}</h2>
  <div
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium',
      today && `${secondary.today} ${secondary.text} font-semibold`
    )}
  >
    {dateString}
  </div>
</div>
```

#### `/src/features/calendar/components/layout/Header/DateNavigator.tsx`

**変更内容**:

- Todayボタンとナビゲーション矢印の統一
- テキスト色のテーマ化

**修正前**:

```tsx
<button className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
  <span>{todayLabel}</span>
</button>
<button className="p-1.5 hover:bg-accent/50 text-muted-foreground">
  <ChevronLeft className="h-5 w-5" />
</button>
```

**修正後**:

```tsx
<button className={cn(
  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
  secondary.DEFAULT,
  secondary.text,
  secondary.hover
)}>
  <span>{todayLabel}</span>
</button>
<button className={cn(
  'p-1.5 rounded-full transition-colors',
  secondary.hover,
  text.muted,
  'hover:text-foreground'
)}>
  <ChevronLeft className={arrowSizes[arrowSize]} />
</button>
```

#### `/src/features/calendar/components/layout/Header/ViewSwitcher.tsx`

**変更内容**:

- ドロップダウン背景とボーダーの調整
- 項目ホバー効果の統一
- アクティブ項目のホバー無効化

**修正前**:

```tsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  <span>{currentOption?.label}</span>
</button>
<div className="bg-background border border-border rounded-md">
  <button className="hover:bg-accent/50">
    <span>{option.label}</span>
  </button>
</div>
```

**修正後**:

```tsx
<button className={cn(
  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
  secondary.DEFAULT,
  secondary.text,
  secondary.hover
)}>
  <span>{currentOption?.label}</span>
</button>
<div className={cn(
  'absolute right-0 top-full mt-1 min-w-[160px]',
  background.base,
  radius.md,
  'shadow-lg z-50'
)}>
  <button className={cn(
    'w-full text-left px-4 py-2 text-sm transition-colors',
    currentView === option.value
      ? `${selection.active} ${selection.text} font-medium`
      : `${text.muted} ${secondary.hover}`
  )}>
    <span>{option.label}</span>
  </button>
</div>
```

#### `/src/features/calendar/components/layout/Header/DateRangeDisplay.tsx`

**変更内容**:

- 週数バッジのセマンティクス改善（span → h6）
- 角丸をfullからxsに変更
- 囲い線の色統一

**修正前**:

```tsx
<h1 className="text-xl font-semibold">
  {formattedDate}
</h1>
<span className="text-xs font-medium border border-secondary rounded-full">
  week{weekNumber}
</span>
```

**修正後**:

```tsx
<h2 className={heading.h2}>
  {formattedDate}
</h2>
<h6 className={cn(
  'inline-flex items-center px-2 py-1',
  'rounded-xs border',
  heading.h6,
  border.universal,
  secondary.text
)}>
  week{weekNumber}
</h6>
```

### 3. 🎨 カラーテーマ詳細変更

#### Primary カラー

```typescript
// 用途を明確化：メインボタン専用
export const primary = {
  DEFAULT: 'bg-blue-600 dark:bg-blue-500',
  hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
  text: 'text-white', // ボタン内は常に白
}
```

#### Secondary カラー

```typescript
// グレー系で統一、elevatedレベルの背景色
export const secondary = {
  DEFAULT: 'bg-neutral-300 dark:bg-neutral-700',
  hover: 'hover:bg-neutral-400 dark:hover:bg-neutral-600',
  text: 'text-neutral-900 dark:text-neutral-100',
  today: 'bg-neutral-400 dark:bg-neutral-600', // 🆕 当日ハイライト専用
}
```

#### Selection カラー

```typescript
// インタラクション状態専用（ボタン以外）
export const selection = {
  DEFAULT: 'bg-blue-50 dark:bg-blue-950/50',
  hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/70',
  active: 'bg-blue-200 dark:bg-blue-900/40',
  text: 'text-blue-800 dark:text-blue-200',
}
```

#### Background システム

```typescript
// 階層的な背景色
export const background = {
  base: 'bg-neutral-100 dark:bg-neutral-900', // レベル0：ページ背景
  surface: 'bg-neutral-200 dark:bg-neutral-800', // レベル1：カード・セクション
  elevated: 'bg-neutral-300 dark:bg-neutral-700', // レベル2：ネストされた要素
}
```

#### Border システム

```typescript
// 境界線の濃さ階層
export const border = {
  subtle: 'border-neutral-50 dark:border-neutral-950',
  DEFAULT: 'border-neutral-100 dark:border-neutral-900',
  strong: 'border-neutral-200 dark:border-neutral-800',
  universal: 'border-neutral-400', // 🆕 モード共通の汎用色
}
```

## 🔄 インタラクション状態の統一

### ホバー効果パターン

1. **ボタン系**: `secondary.hover`
2. **選択リスト**: `selection.hover`
3. **当日ハイライト**: ホバー効果なし（固定表示）

### 選択状態パターン

1. **アクティブ項目**: `selection.active` + `selection.text`
2. **当日表示**: `secondary.today` + `secondary.text`
3. **通常選択**: `selection.DEFAULT` + 適切なテキスト色

### フォーカス状態

- `ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2`
- アクセシビリティ確保

## 📊 統計情報

### 修正ファイル数

- **コンポーネントファイル**: 8ファイル
- **テーマファイル**: 2ファイル（colors.ts, typography.ts）
- **総修正行数**: 約150行

### 削減したハードコード

- 直接色指定: 約30箇所 → 0箇所
- 個別フォントサイズ: 約15箇所 → テーマ統一
- カスタムホバー効果: 約20箇所 → 3パターンに集約

### 一貫性向上

- カラーパターン: 個別指定 → 4カテゴリに統一
- タイポグラフィ: 個別サイズ → 6段階階層
- インタラクション: バラバラ → 3パターンに統一

---

**📌 この統一により、新しいコンポーネント作成時も既存パターンを踏襲するだけで一貫したデザインが実現できるようになりました。**

---

**最終更新**: 2025-09-18
