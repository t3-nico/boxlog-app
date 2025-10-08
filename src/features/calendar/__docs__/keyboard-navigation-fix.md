# カレンダービューのキーボードナビゲーション統一修正

## 概要

カレンダービューのスクロール機能において、Week Viewでは動作するがDay/3Day/2Week Viewでは動作しない問題を修正しました。

## 問題の詳細

### 症状

- **Week View**: キーボードナビゲーション（PageUp/PageDown、Ctrl+矢印キー等）が正常に動作
- **Day/3Day/2Week View**: 同じキーボード操作でスクロールが動作しない

### 原因分析

#### 1. ScrollableCalendarLayoutの呼び出し確認

- 全ビューで`ScrollableCalendarLayout`は正しく呼び出されている
- `enableKeyboardNavigation={true}`も正しく設定されている

#### 2. レイアウト構造の差異発見

**Week View（動作する）:**

```tsx
<CalendarViewAnimation viewType="week">
  <div className="bg-background flex h-full flex-col">
    <div className="min-h-0 flex-1">
      {' '}
      // ← 重要な設定
      <WeekGrid>
        <CalendarLayoutWithHeader />
      </WeekGrid>
    </div>
  </div>
</CalendarViewAnimation>
```

**Day/3Day/2Week View（動作しない）:**

```tsx
<CalendarViewAnimation viewType="xxx">
  <CalendarLayoutWithHeader /> // ← 外側コンテナなし
</CalendarViewAnimation>
```

#### 3. 根本原因

`CalendarViewAnimation`は`h-full`クラスを持つdivでラップしているが、Day/3Day/2Weekビューでは適切な`min-h-0`や`flex-1`設定がないため、ScrollableCalendarLayoutのスクロールコンテナが正しい高さを取得できていない。

## 修正内容

### 1. レイアウト構造の統一

全ビューでWeek Viewと同じレイアウト構造を適用：

```tsx
<CalendarViewAnimation viewType="xxx">
  <div className="bg-background flex h-full flex-col">
    <div className="min-h-0 flex-1">
      <CalendarLayoutWithHeader className="h-full">{/* コンテンツ */}</CalendarLayoutWithHeader>
    </div>
  </div>
</CalendarViewAnimation>
```

### 2. 修正対象ファイル

#### DayView.tsx

```tsx
// 修正前
<CalendarViewAnimation viewType="day">
  <CalendarLayoutWithHeader className={cn('bg-background', className)}>

// 修正後
<CalendarViewAnimation viewType="day">
  <div className={cn('flex flex-col h-full bg-background', className)}>
    <div className="flex-1 min-h-0">
      <CalendarLayoutWithHeader className="h-full">
```

#### ThreeDayView.tsx

```tsx
// 修正前
<CalendarLayoutWithHeader className={cn('bg-background', className)}>

// 修正後
<div className={cn('flex flex-col h-full bg-background', className)}>
  <div className="flex-1 min-h-0">
    <CalendarLayoutWithHeader className="h-full">
```

#### TwoWeekView.tsx

```tsx
// 修正前
<CalendarViewAnimation viewType="2week">
  <CalendarLayoutWithHeader className={cn('bg-background', className)}>

// 修正後
<CalendarViewAnimation viewType="2week">
  <div className={cn('flex flex-col h-full bg-background', className)}>
    <div className="flex-1 min-h-0">
      <CalendarLayoutWithHeader className="h-full">
```

### 3. 構文エラー修正

ThreeDayView.tsxで発生した構文エラー（return文の欠落）を修正。

### 4. デバッグログの削除

開発用に追加していたデバッグログをすべて削除し、本番用コードとして整理。

## 動作確認済みキーボードショートカット

全ビューで以下のキーボードナビゲーションが統一して動作：

- **PageUp/PageDown**: 画面単位でのスクロール
- **Ctrl+Home/End**: 最上部・最下部へスクロール
- **Ctrl+↑/↓**: 1時間単位でのスクロール

## 技術的なポイント

### 1. Flexboxレイアウトの重要性

```css
.flex-1      /* flex: 1 1 0% - 残り空間を占有 */
.min-h-0     /* min-height: 0 - flex itemの最小高さ制限を解除 */
.h-full      /* height: 100% - 親の高さを継承 */
```

### 2. ScrollableCalendarLayoutの仕組み

- `overflow-y-auto`でスクロール可能エリアを作成
- `tabIndex={0}`でキーボードフォーカスを受け取り可能
- グローバルキーボードイベントリスナーでキー操作を検出

### 3. overflow設定の競合チェック

各ビューコンポーネントで独自の`overflow-y-auto`設定がないことを確認済み。

## 今後の注意点

### 新しいビューコンポーネント作成時

1. **統一レイアウト構造を使用**

```tsx
<CalendarViewAnimation viewType="newview">
  <div className="bg-background flex h-full flex-col">
    <div className="min-h-0 flex-1">
      <CalendarLayoutWithHeader className="h-full">{/* コンテンツ */}</CalendarLayoutWithHeader>
    </div>
  </div>
</CalendarViewAnimation>
```

2. **競合するoverflow設定を避ける**

```tsx
// ❌ 避けるべきパターン
<div className="overflow-y-auto">
  <ScrollableCalendarLayout>

// ✅ 正しいパターン
<ScrollableCalendarLayout>
  <div className="h-full">
```

3. **enableKeyboardNavigation={true}を必ず設定**

## 関連ファイル

- `src/features/calendar/components/views/DayView/DayView.tsx`
- `src/features/calendar/components/views/ThreeDayView/ThreeDayView.tsx`
- `src/features/calendar/components/views/TwoWeekView/TwoWeekView.tsx`
- `src/features/calendar/components/views/WeekView/WeekView.tsx` (参考)
- `src/features/calendar/components/views/shared/components/ScrollableCalendarLayout.tsx`

## 修正日時

2025-08-19 - 統一キーボードナビゲーション修正完了
