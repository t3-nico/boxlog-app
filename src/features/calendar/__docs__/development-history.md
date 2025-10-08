# Calendar Feature Development History

## 📅 開発履歴

このドキュメントは `/src/features/calendar/` で行われた開発作業の時系列記録です。

---

## 2025-08-19: カレンダービューキーボードナビゲーション統一修正

### 🎯 目的

- 全カレンダービュー（Day/3Day/Week/2Week）で統一されたキーボードナビゲーション
- ScrollableCalendarLayoutを使った一貫したスクロール体験の実現

### 🔧 作業内容

#### 1. 問題の特定

- Week Viewではキーボードナビゲーション（PageUp/PageDown、Ctrl+矢印キー）が動作
- Day/3Day/2Week Viewでは同じ操作でスクロールが動作しない問題を発見

#### 2. 根本原因の分析

- Week Viewと他ビューのレイアウト構造の差異を特定
- ScrollableCalendarLayoutが適切な高さを取得できない構造的問題

#### 3. レイアウト構造の統一

全ビューで以下の統一レイアウト構造を適用：

```tsx
<CalendarViewAnimation viewType="xxx">
  <div className="bg-background flex h-full flex-col">
    <div className="min-h-0 flex-1">
      <CalendarLayoutWithHeader className="h-full">{/* コンテンツ */}</CalendarLayoutWithHeader>
    </div>
  </div>
</CalendarViewAnimation>
```

#### 4. 修正対象ファイル

- `DayView/DayView.tsx`
- `ThreeDayView/ThreeDayView.tsx`
- `TwoWeekView/TwoWeekView.tsx`
- `ScrollableCalendarLayout.tsx` (デバッグログ削除)

### ✅ 結果

全ビューで統一されたキーボードナビゲーションが動作：

- PageUp/PageDown: 画面単位スクロール
- Ctrl+Home/End: 最上部/最下部移動
- Ctrl+↑/↓: 1時間単位スクロール

### 📚 関連ドキュメント

詳細: `keyboard-navigation-fix.md`

---

## 2025-01-XX: Calendar Views リファクタリング & 統合

### 🎯 目的

- カレンダービューコンポーネントの整理・統合
- 一貫性のあるコンポーネント構造の確立
- 再利用可能なコンポーネント設計の実装

### 📁 作業内容

#### 1. 既存構造の調査・整理

**作業前の状況:**

```
src/features/calendar/components/
├── views/
│   ├── DayView/index.tsx (OldDayView)
│   ├── ThreeDayView/index.tsx
│   ├── WeekView/ (WeekCalendarLayout)
│   └── TwoWeekView/index.tsx (MonthView)
├── calendar-grid/ (多数の重複コンポーネント)
├── shared/layouts/ (viewsと重複)
└── 各種散在したコンポーネント
```

**問題点:**

- コンポーネントの重複・散在
- 一貫性のない命名・構造
- viewsとlayoutsの役割重複

#### 2. DayView の統合・再構築

**実施内容:**

- OldDayViewの機能を調査・分析
- 新しいDayView構造を設計・実装
- OldDayViewの機能（ViewTransition、タイムゾーン対応）を統合
- OldDayViewディレクトリを削除

**新しい構造:**

```
views/DayView/
├── index.tsx
├── DayView.tsx
├── DayView.types.ts
├── hooks/
│   ├── useDayView.ts
│   └── useDayEvents.ts
└── components/
    └── DayContent.tsx
```

**特徴:**

- 1日表示に特化
- 現在時刻への自動スクロール
- ViewTransitionアニメーション統合
- タイムゾーン対応

#### 3. WeekView のブラッシュアップ

**実施内容:**

- 既存のWeekCalendarLayoutを活用
- 型定義の詳細化
- フック分離によるロジック整理
- 7日表示の最適化

**新しい構造:**

```
views/WeekView/
├── index.tsx
├── WeekView.tsx
├── WeekView.types.ts
├── WeekCalendarLayout.tsx (レガシー)
├── hooks/
│   ├── useWeekView.ts
│   └── useWeekEvents.ts
└── components/
    └── WeekGrid.tsx
```

**特徴:**

- 7日間を均等分割表示
- 週の開始日設定可能（日曜/月曜）
- イベント重複表示対応
- 週末表示の切り替え

#### 4. ThreeDayView の再実装

**実施内容:**

- 完全に新しい3日表示を実装
- モバイル最適化を重視
- 中央日を基準にした前後1日表示

**新しい構造:**

```
views/ThreeDayView/
├── index.tsx
├── ThreeDayView.tsx
├── ThreeDayView.types.ts
└── hooks/
    └── useThreeDayView.ts
```

**特徴:**

- [yesterday, today, tomorrow] の3日表示
- 各日33.3%の均等幅
- モバイルフレンドリー
- 中央日のハイライト表示

#### 5. TwoWeekView の新規作成

**実施内容:**

- 2週間表示ビューを新規実装
- 既存のMonthViewの代替として設計
- 横スクロール対応

**新しい構造:**

```
views/TwoWeekView/
├── index.tsx
├── TwoWeekView.tsx
├── TwoWeekView.types.ts
└── hooks/
    └── useTwoWeekView.ts
```

**特徴:**

- 14日連続表示
- 横スクロール必須
- 各日7.14%幅
- デスクトップ向け最適化
- MonthViewエイリアス提供

#### 6. AgendaView の新規作成

**実施内容:**

- Googleカレンダー風のリスト表示を実装
- 日付グループ化によるアジェンダビュー
- 詳細情報表示に最適化

**新しい構造:**

```
views/AgendaView/
├── index.tsx
├── AgendaView.tsx
├── AgendaView.types.ts
├── components/
│   ├── AgendaDayGroup.tsx
│   ├── AgendaEventItem.tsx
│   ├── AgendaEmptyState.tsx
│   └── AgendaHeader.tsx
└── hooks/
    └── useAgendaView.ts
```

**特徴:**

- 日付ごとのグループ化
- 縦スクロールリスト形式
- イベント詳細表示（時間・場所・説明）
- スティッキーヘッダー
- 今日へのジャンプ機能

#### 7. 共通コンポーネントの整理

**実施内容:**

- `/shared/` ディレクトリの統合
- 再利用可能コンポーネントの作成
- 重複コンポーネントの削除

**主要な共通コンポーネント:**

- `DateHeader` - 日付ヘッダー表示
- `TimeColumn` - 時間軸表示
- `CurrentTimeLine` - 現在時刻線
- `EventBlock` - イベント表示ブロック
- `TimezoneOffset` - タイムゾーン表示

#### 8. 不要コンポーネントの削除

**削除したもの:**

- `/calendar-grid/` の重複コンポーネント
- `/shared/layouts/` の重複レイアウト
- `TimelineView/` ディレクトリ
- `TrashView.tsx` (将来再実装予定)
- GoogleStyleCalendar、PureCalendarLayoutOptimized等

### 📊 結果

#### Before (作業前)

```
components/
├── views/ (4個の基本ビュー、構造バラバラ)
├── calendar-grid/ (20+個の重複コンポーネント)
├── shared/layouts/ (viewsと重複)
├── accessibility/ (削除済み)
├── add-popup/ (別途整理済み)
└── 散在したコンポーネント
```

#### After (作業後)

```
components/
├── views/
│   ├── DayView/ (完全統合)
│   ├── ThreeDayView/ (新規実装)
│   ├── WeekView/ (ブラッシュアップ)
│   ├── TwoWeekView/ (新規実装)
│   └── AgendaView/ (新規実装)
├── shared/ (統合済み共通コンポーネント)
├── overlays/ (UIオーバーレイ)
├── layout/ (レイアウトコンポーネント)
├── interactions/ (インタラクション)
└── event/ (イベント関連)
```

### 🎯 達成された改善点

1. **構造の一貫性**
   - 全ビューで統一されたファイル構造
   - 型定義の標準化
   - フックによるロジック分離

2. **再利用性の向上**
   - 共通コンポーネントの整理
   - プロップスインターフェースの統一
   - 機能別の責務分離

3. **保守性の向上**
   - 重複コードの削除
   - 明確な命名規則
   - 包括的な型定義

4. **機能性の拡張**
   - 新しいビュータイプの追加
   - 既存機能の統合・強化
   - モバイル対応の改善

### 🔧 技術的詳細

#### 使用技術・ライブラリ

- **React 18** + TypeScript
- **date-fns** - 日付操作
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UI コンポーネント
- **Lucide React** - アイコン

#### 設計パターン

- **カスタムフック** - ビューロジック分離
- **コンポーネント分割** - 単一責任原則
- **型安全性** - 包括的TypeScript型定義
- **Props統一** - 一貫したインターフェース

#### パフォーマンス考慮

- **useMemo** - 計算の最適化
- **useCallback** - 関数メモ化
- **React.memo** - 不要な再レンダリング防止
- **仮想スクロール対応準備** - 大量データ対応

### 📝 今後の予定

1. **ゴミ箱機能の再実装** - TrashViewの新規作成
2. **パフォーマンス最適化** - 大量イベント対応
3. **アクセシビリティ改善** - ARIA属性、キーボード操作
4. **テスト追加** - ユニットテスト・統合テスト
5. **ドキュメント整備** - 使用方法・カスタマイズガイド

---

## 2025-08-19: 統一スクロールレイアウトシステム実装

### 🎯 目的

- 時間ラベルとグリッド線の完全同期
- UTCタイムゾーン表示の統一
- レスポンシブHOUR_HEIGHT対応
- 全ビューでの一貫したスクロール動作

### 📁 主要な変更内容

#### 1. ScrollableCalendarLayout の新規作成

**ファイル:** `src/features/calendar/components/views/shared/components/ScrollableCalendarLayout.tsx`

**機能:**

- 統一されたスクロール可能レイアウトシステム
- TimeColumnとグリッドコンテンツの同期スクロール
- UTCタイムゾーンの左端固定配置
- レスポンシブHOUR_HEIGHT対応

**技術的詳細:**

```typescript
interface ScrollableCalendarLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode // 統合ヘッダー
  timezone?: string
  scrollToHour?: number // 初期スクロール位置
  showTimeColumn?: boolean // 時間軸表示制御
  showCurrentTime?: boolean // 現在時刻線表示制御
  showTimezone?: boolean // UTC表示制御
  timeColumnWidth?: number // 時間軸幅 (default: 64px)
  onTimeClick?: (hour: number, minute: number) => void
  displayDates?: Date[] // 表示対象日付
  viewMode?: 'day' | '3day' | 'week' | '2week'
}
```

**アーキテクチャ:**

```
ScrollableCalendarLayout
├── ヘッダーエリア（非スクロール）
│   ├── UTC/タイムゾーン表示（左端固定）
│   └── 各ビューの日付ヘッダー
└── スクロール可能コンテンツエリア
    ├── TimeColumn（sticky left-0）
    ├── CurrentTimeLine（絶対位置）
    └── メインコンテンツ（children）
```

#### 2. useResponsiveHourHeight フックの実装

**ファイル:** `src/features/calendar/components/views/shared/hooks/useResponsiveHourHeight.ts`

**機能:**

- デバイスサイズに応じた動的HOUR_HEIGHT制御
- ブレークポイント対応：モバイル(48px)、タブレット(60px)、デスクトップ(72px)
- リアルタイムリサイズ対応

**実装:**

```typescript
export function useResponsiveHourHeight(config: Partial<ResponsiveHourHeightConfig> = {}): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const [hourHeight, setHourHeight] = useState<number>(HOUR_HEIGHT)

  useEffect(() => {
    const updateHourHeight = () => {
      const width = window.innerWidth
      if (width < 768) {
        setHourHeight(finalConfig.mobile)
      } else if (width < 1024) {
        setHourHeight(finalConfig.tablet)
      } else {
        setHourHeight(finalConfig.desktop)
      }
    }
    updateHourHeight()
    window.addEventListener('resize', updateHourHeight)
    return () => window.removeEventListener('resize', updateHourHeight)
  }, [finalConfig.mobile, finalConfig.tablet, finalConfig.desktop])

  return hourHeight
}
```

#### 3. 各ビューの統一レイアウト移行

**DayView の修正:**

- 独自レイアウトから`CalendarLayoutWithHeader`に移行
- TimeColumn、CurrentTimeLine、TimezoneOffsetの個別配置を削除
- 統一されたヘッダーシステムに対応

**Before:**

```tsx
<div className="flex h-full flex-col">
  <div className="shrink-0 border-b">
    <div className="flex h-full">
      <div style={{ width: TIME_COLUMN_WIDTH }}>
        <TimezoneOffset />
      </div>
      <div className="flex-1">
        <DateHeader />
      </div>
    </div>
  </div>
  <div className="flex flex-1">
    <div style={{ width: TIME_COLUMN_WIDTH }}>
      <TimeColumn />
    </div>
    <div className="flex-1 overflow-y-auto">
      <CurrentTimeLine />
      <DayContent />
    </div>
  </div>
</div>
```

**After:**

```tsx
<CalendarLayoutWithHeader
  header={headerComponent}
  timezone={timezone}
  scrollToHour={isToday ? undefined : 8}
  displayDates={displayDates}
  viewMode="day"
  onTimeClick={handleTimeClick}
>
  <DayContent />
</CalendarLayoutWithHeader>
```

**ThreeDayView、WeekView、TwoWeekView の修正:**

- 全て同様に統一レイアウトシステムに移行
- ヘッダーコンポーネントから時間列オフセットを削除
- 一貫したスクロール動作を実現

#### 4. TwoWeekView の画面幅対応改善

**変更点:**

- 14日分を`overflow-x-auto`から`flex-1`による画面幅均等分割に変更
- 週ごとの太い区切り線（`border-l-2 border-l-primary/20`）を削除
- 日付ヘッダーの縦線（`border-r border-border`）を削除

**Before:**

```tsx
<div className="flex overflow-x-auto">
  {twoWeekDates.map((date, index) => {
    const isFirstOfWeek = index % 7 === 0
    const weekIndex = Math.floor(index / 7)

    return (
      <div
        className={cn(
          'shrink-0 border-r border-border',
          isFirstOfWeek && weekIndex > 0 && 'border-l-2 border-l-primary/20'
        )}
        style={{ minWidth: '80px' }}
      >
```

**After:**

```tsx
<div className="flex">
  {twoWeekDates.map((date, index) => (
    <div
      className="flex-1"
      style={{ width: `${100 / 14}%` }}
    >
```

#### 5. 時間ラベルの完全同期実現

**問題:**

- TimeColumnが固定位置にあり、グリッドコンテンツとは別のスクロール領域
- スクロール時に時間ラベルとグリッド線がずれる

**解決策:**

- TimeColumnをスクロール可能領域内に移動
- `sticky left-0 z-10`でスクロール時も左端に固定表示
- グリッドコンテンツと同じスクロールコンテナ内で同期

**実装:**

```tsx
<div className="relative flex-1 overflow-y-auto" onClick={handleGridClick}>
  <div className="flex w-full" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
    {/* 時間軸列 - スクロールと同期 */}
    {showTimeColumn && (
      <div className="bg-muted/5 sticky left-0 z-10 shrink-0" style={{ width: timeColumnWidth }}>
        <TimeColumn startHour={0} endHour={24} hourHeight={HOUR_HEIGHT} format="24h" className="h-full" />
      </div>
    )}

    {/* グリッドコンテンツエリア */}
    <div className="relative flex-1">
      {showCurrentTime && <CurrentTimeLine />}
      {children}
    </div>
  </div>
</div>
```

### 📊 技術的改善点

#### 1. HOUR_HEIGHT の統一

**Before:** 複数の定数が散在

- `calendar-constants.ts`: 48px
- `grid.constants.ts`: 60px
- 各ビューファイル: 72px

**After:** 統一された定数とレスポンシブ対応

- `grid.constants.ts`: `export const HOUR_HEIGHT = 72`
- `useResponsiveHourHeight`: デバイス別動的調整

#### 2. コンポーネント統合

**Before:** 各ビューが個別レイアウト実装

- 重複コード
- 一貫性のないスクロール動作
- UTCタイムゾーン表示位置のばらつき

**After:** 統一レイアウトシステム

- `ScrollableCalendarLayout`による一元管理
- 全ビューで一貫したスクロール動作
- UTCタイムゾーンの左端固定配置

#### 3. レスポンシブ対応の強化

- 動的HOUR_HEIGHT調整
- ブレークポイント対応
- リアルタイムリサイズ対応

### 🎯 達成された改善点

1. **時間ラベルとグリッド線の完全同期**
   - Googleカレンダーと同様の正確な位置合わせ
   - スクロール時の同期動作

2. **UTCタイムゾーン表示の統一**
   - 全ビューで左端固定配置
   - 一貫したタイムゾーン情報表示

3. **レスポンシブデザインの向上**
   - デバイスサイズに応じた最適なHOUR_HEIGHT
   - 動的調整によるユーザビリティ向上

4. **2WeekViewの使いやすさ向上**
   - 画面幅に完全対応
   - 不要な境界線削除によるクリーンな見た目

5. **コードの保守性向上**
   - 統一レイアウトシステムによる重複削除
   - 一貫したコンポーネント設計

### 🔧 影響範囲

**修正されたファイル:**

- `ScrollableCalendarLayout.tsx` (新規)
- `useResponsiveHourHeight.ts` (新規)
- `DayView.tsx`
- `ThreeDayView.tsx`
- `WeekGrid.tsx`
- `TwoWeekView.tsx`
- `grid.constants.ts`
- `TimeLabel.tsx`
- `useTimeGrid.ts`

**ドキュメント更新:**

- `layout-system.md` - 統一レイアウトシステム追加
- `shared-components.md` - 新規コンポーネント情報追加
- `views-architecture.md` - TwoWeekView仕様更新

### 📝 今後の予定

1. **パフォーマンス最適化**
   - 大量イベント表示時の仮想化対応
   - メモ化の最適化

2. **アクセシビリティ向上**
   - キーボードナビゲーション強化
   - スクリーンリーダー対応改善

3. **機能拡張**
   - カスタムHOUR_HEIGHT設定
   - タイムゾーン切り替え機能

---

## 2025-08-20: 現在時刻線（CurrentTimeLine）統一実装

### 🎯 目的

- 全カレンダービューで統一された現在時刻線表示
- ScrollableCalendarLayout内での完全制御
- 当日のスロット（列）のみに現在時刻線を表示
- 視認性の良い色とシンプルなデザインの実現

### 🔧 作業内容

#### 1. 問題の特定と課題

**問題点:**

- 現在時刻線が各ビューでまちまちな表示
- DayColumn、TimeGrid、ScrollableCalendarLayoutで重複実装
- 今日以外の日付でも画面全幅に表示される
- 赤色（red-500）で視認性が低い

**課題:**

- 複数の CurrentTimeLine 実装が存在し制御が複雑
- 各ビューの構造に依存した表示ロジック
- 時間表記が不要な情報として表示

#### 2. 重複実装の統一化

**重複していた実装箇所:**

```typescript
// 1. ScrollableCalendarLayout.tsx
<CurrentTimeLine hourHeight={HOUR_HEIGHT} displayDates={displayDates} />

// 2. DayColumn.tsx
{isTodayActual && <CurrentTimeLineForColumn hourHeight={hourHeight} />}

// 3. TimeGrid.tsx
{showCurrentTime && <SimpleCurrentTimeLine />}
```

**統一後の実装:**

```typescript
// ScrollableCalendarLayout.tsx のみで制御
{shouldShowCurrentTimeLine && todayColumnPosition && (
  <>
    {/* 横線 - 今日の列のみ */}
    <div className="absolute h-[2px] bg-blue-600 dark:bg-blue-400 z-40 pointer-events-none shadow-sm" />
    {/* 点 - 今日の列の左端 */}
    <div className="absolute w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full z-40 pointer-events-none shadow-md border border-white dark:border-gray-800" />
  </>
)}
```

#### 3. 今日の列のみ表示機能実装

**列位置計算ロジック:**

```typescript
const todayColumnPosition = useMemo(() => {
  if (!displayDates || displayDates.length === 0) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayIndex = displayDates.findIndex((date) => {
    if (!date) return false
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })

  if (todayIndex === -1) return null

  // 単一日表示の場合
  if (displayDates.length === 1) {
    return { left: 0, width: '100%' }
  }

  // 複数日表示の場合、列の幅と位置を計算
  const columnWidth = 100 / displayDates.length
  const leftPosition = todayIndex * columnWidth

  return {
    left: `${leftPosition}%`,
    width: `${columnWidth}%`,
  }
}, [displayDates])
```

**表示制御:**

```typescript
const shouldShowCurrentTimeLine = useMemo(() => {
  return showCurrentTime && todayColumnPosition !== null
}, [showCurrentTime, todayColumnPosition])
```

#### 4. 視覚デザインの改善

**色の変更:**

- **Before**: `bg-red-500` (赤色、低コントラスト)
- **After**: `bg-blue-600 dark:bg-blue-400` (青色、ダークモード対応)

**時間表記の削除:**

- 時刻ラベル（例: "14:30"）の表示を完全削除
- `currentTimeString` 生成ロジックも削除

**視覚効果の追加:**

- 横線: `shadow-sm` 追加
- 点: `shadow-md` と `border border-white dark:border-gray-800` 追加

#### 5. リアルタイム更新機能

**1分ごとの自動更新:**

```typescript
const [currentTime, setCurrentTime] = useState(new Date())

useEffect(() => {
  if (!shouldShowCurrentTimeLine) return

  const updateCurrentTime = () => setCurrentTime(new Date())
  updateCurrentTime()

  const timer = setInterval(updateCurrentTime, 60000)
  return () => clearInterval(timer)
}, [shouldShowCurrentTimeLine])
```

**位置計算:**

```typescript
const currentTimePosition = useMemo(() => {
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const totalHours = hours + minutes / 60
  return totalHours * HOUR_HEIGHT
}, [currentTime, HOUR_HEIGHT])
```

### 📊 各ビューでの動作

#### DayView

- **表示範囲**: 全幅（100%）
- **条件**: `displayDates = [currentDate]` で今日の場合のみ表示

#### WeekView

- **表示範囲**: 今日の曜日列のみ（1/7幅 ≈ 14.3%）
- **条件**: `displayDates = [日, 月, 火, 水, 木, 金, 土]` で今日が含まれる場合

#### ThreeDayView

- **表示範囲**: 今日の列のみ（1/3幅 ≈ 33.3%）
- **条件**: `displayDates = [yesterday, today, tomorrow]` で今日が含まれる場合

#### TwoWeekView

- **表示範囲**: 今日の列のみ（1/14幅 ≈ 7.1%）
- **条件**: `displayDates = [14日間の配列]` で今日が含まれる場合

### 🎯 技術的改善点

#### 1. 制御の一元化

**Before**: 3箇所での分散実装

```
- ScrollableCalendarLayout (グローバル制御)
- DayColumn (列レベル制御)
- TimeGrid (グリッドレベル制御)
```

**After**: 1箇所での統一制御

```
ScrollableCalendarLayout
└── 直接JSX描画による完全制御
```

#### 2. 依存関係の簡略化

**Before**: CurrentTimeLineコンポーネントへの依存

```typescript
import { CurrentTimeLine } from '../CurrentTimeLine'
<CurrentTimeLine hourHeight={...} displayDates={...} />
```

**After**: 自己完結型の実装

```typescript
// インポート不要、直接JSX描画
<div className="absolute h-[2px] bg-blue-600..." />
```

#### 3. 精確な位置制御

**Before**: 画面全幅やビュー依存の表示

```css
left: 0;
right: 0;
width: 100%;
```

**After**: 数学的に正確な列位置

```css
left: `${(todayIndex * 100) / displayDates.length}%`;
width: `${100 / displayDates.length}%`;
```

### ✅ 達成された改善点

1. **統一性の確保**
   - 全ビューで同じ表示ロジック
   - 一貫したビジュアルデザイン
   - 統一された更新タイミング

2. **精確性の向上**
   - 当日の列のみへの正確な表示
   - 数学的計算による位置精度
   - リアルタイム時刻同期

3. **視認性の改善**
   - 青色による高コントラスト
   - ダークモード完全対応
   - 影効果による立体感

4. **保守性の向上**
   - 単一ファイルでの完全制御
   - 重複コードの完全削除
   - シンプルな実装構造

5. **パフォーマンスの向上**
   - 不要なコンポーネント削除
   - 直接描画による軽量化
   - 条件分岐の最適化

### 🔧 修正されたファイル

**メインファイル:**

- `ScrollableCalendarLayout.tsx` - 現在時刻線の完全制御実装

**削除されたファイル:**

- `SimpleCurrentTimeLine.tsx` - 重複実装のため削除

**修正されたファイル:**

- `DayColumn.tsx` - CurrentTimeLineForColumn使用を削除
- `TimeGrid.tsx` - CurrentTimeLine使用をコメントアウト
- `CurrentTimeLine.tsx` - 最終的には使用されないが保持

**型定義更新:**

- `TimeGridProps` - displayDatesプロパティ追加

### 📱 ユーザー体験の向上

#### Before (修正前)

```
❌ ビューによって現在時刻線がバラバラ
❌ 今日以外でも画面全幅に表示
❌ 赤色で視認性が低い
❌ 不要な時間表記が表示
❌ 重複による表示の重なり
```

#### After (修正後)

```
✅ 全ビューで統一された表示
✅ 当日のスロットのみに正確表示
✅ 青色で高い視認性
✅ シンプルで清潔なデザイン
✅ 1本の美しい現在時刻線
```

### 📝 技術ドキュメント

**アーキテクチャ:**

```
ScrollableCalendarLayout
├── todayColumnPosition: 今日の列位置計算
├── shouldShowCurrentTimeLine: 表示条件判定
├── currentTimePosition: Y座標計算
└── JSX直接描画: 現在時刻線表示
    ├── 横線 (bg-blue-600, 今日の列幅)
    └── 点 (bg-blue-600, 列左端)
```

**依存関係:**

```
各ビュー → displayDates → ScrollableCalendarLayout → 現在時刻線表示
```

---

## 🏗️ アーキテクチャ概要

### ビュー階層

```
CalendarController
└── 各種ビュー (DayView, WeekView, etc.)
    ├── 専用フック (useXxxView)
    ├── 型定義 (XxxView.types.ts)
    └── サブコンポーネント
        ├── 共通コンポーネント (shared/)
        └── ビュー固有コンポーネント
```

### データフロー

```
Props → フック → 計算ロジック → UI表示
  ↓
イベントハンドラー → 上位コンポーネント → 状態更新
```

---

_このドキュメントは開発作業の記録として作成されました。_  
_更新日: 2025-01-XX_  
_作成者: Claude (AI Assistant)_
