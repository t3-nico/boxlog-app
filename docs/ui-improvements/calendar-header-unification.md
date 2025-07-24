# カレンダーヘッダー統一とUI改善

## 概要

カレンダービューにおけるヘッダーの完全統一と、予定表示カードのGoogleカレンダー風デザイン改善を実施しました。

## 実装内容

### 1. 統一カレンダーヘッダーの実装

#### 問題点
- 各ビュー（Day, Week, 3Days等）で異なるヘッダー表示
- 重複したヘッダーコンポーネントの存在
- 真の意味でのコンポーネント化ができていない

#### 解決策
- `UnifiedCalendarHeader`コンポーネントの作成
- CalendarViewレベルでの単一ヘッダーインスタンス管理
- 全ビューで統一された期間表示形式

#### アーキテクチャ
```
CalendarView (親)
├── UnifiedCalendarHeader (共通ヘッダー)
│   ├── CalendarHeader (ナビゲーション・ボタン)
│   └── DateHeader (曜日・日付詳細)
└── 各ビュー (DayView, WeekView, 3DayView, etc.)
```

### 2. 期間表示の統一

#### 実装内容
すべてのカレンダービューで「**July 2025 week30**」形式に統一

**対象ビュー:**
- Day: "July 2025 week30"
- 3Days: "July 2025 week30" 
- Week: "July 2025 week30"
- Weekday: "July 2025 week30"
- 2Week: "July 2025 week30"
- Schedule: "July 2025 week30"

#### 技術実装
```typescript
function formatHeaderDate(viewType: CalendarViewType, date: Date): string {
  // すべてのビューで統一した「July 2025 week30」形式
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  return `${format(date, 'MMMM yyyy')}|week${weekNumber}`
}
```

### 3. 分割表示の改善

#### 問題点
- 3daysビューで各日付の中央に分割線がない
- bothモード（予定と記録の同時表示）で視認性が悪い

#### 解決策
- 各日付divの中央に個別の分割線を追加
- 大きなdivの分割線から各日付単位の分割線に変更

#### 実装
```typescript
{/* bothモードの場合は各日付の中央に分割線を表示 */}
{planRecordMode === 'both' && (
  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 -translate-x-0.5 z-20"></div>
)}
```

### 4. Googleカレンダー風予定カードデザイン

#### デザイン変更
**修正前:**
- 薄い背景色（`${eventColor}15`）
- 太いボーダー（`borderLeft: 4px solid ${eventColor}`）
- 時間バッジが別要素
- 複雑なレイアウト

**修正後:**
- 濃い背景色（`backgroundColor: eventColor`）
- 白文字（`text-white`）
- シンプルなボーダー（`border border-white/20`）
- クリーンで統一されたレイアウト

#### カードレイアウト
```
┌─────────────────┐
│ タイトル        │ (font-medium, line-clamp-2)
│ 09:00 - 10:00   │ (opacity-90)
│ 📍 場所        │ (高さがある場合のみ)
└─────────────────┘
```

## 技術的改善

### 1. 無限リロード問題の修正
- useEffect依存関係の最適化
- Zustandストア関数の適切なメモ化
- 不適切なre-renderの防止

### 2. パフォーマンス最適化
- CalendarViewでの適切なuseCallback使用
- ストア関数の直接参照によるメモ化
- 依存関係配列の最適化

### 3. コンポーネント構成の改善
- 重複コンポーネントの削除
- 真のコンポーネント化の実現
- 保守性の向上

## 影響範囲

### 修正されたファイル
- `src/components/box/calendar-view/components/UnifiedCalendarHeader.tsx` (新規作成)
- `src/components/box/calendar-view/CalendarHeader.tsx`
- `src/components/box/calendar-view/CalendarView.tsx`
- `src/components/box/calendar-view/components/FullDayCalendarLayout.tsx`
- 各ビューファイル (DayView, WeekView, ThreeDayView, etc.)

### ユーザー体験の向上
- 全カレンダービューでの一貫したヘッダー表示
- Googleカレンダー風の見慣れたUI
- 分割表示での視認性向上
- パフォーマンス改善による快適な操作

## 今後の保守性

### コンポーネント修正の影響
`CalendarHeader`を修正すると以下すべてに反映：
- `/calendar/day`
- `/calendar/week` 
- `/calendar/3days`
- `/calendar/schedule`
- `/calendar/2week`
- etc.

### 開発効率の向上
- 1つのコンポーネント修正で全ビューに適用
- DRY原則の徹底
- バグ修正・機能追加の効率化

---

*更新日: 2025-01-24*
*関連ブランチ: feature/event-db-integration*