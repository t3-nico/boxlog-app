# Calendar Sidebar Components

カレンダー機能のサイドバー関連コンポーネント群

## 📁 構成

```
Sidebar/
├── Sidebar.tsx           # メインサイドバーコンテナ
├── MiniCalendar.tsx      # 日付選択ミニカレンダー
├── CalendarList.tsx      # カレンダー一覧・管理
├── TagFilter.tsx         # タグフィルタリング
├── QuickActions.tsx      # クイックアクション
├── index.ts              # エクスポート定義
└── README.md             # このファイル
```

## 🎯 主要コンポーネント

### Sidebar
メインのサイドバーコンテナ。すべてのサブコンポーネントを統合し、折りたたみ機能を提供。

**特徴:**
- 折りたたみ対応（48px ↔ 320px）
- セクション別展開/折りたたみ
- レスポンシブデザイン
- アクセシビリティ対応

### MiniCalendar  
日付選択用の小さなカレンダー。

**特徴:**
- date-fns による日本語対応
- 週番号表示オプション
- ハイライト日付対応
- 無効化日付対応
- 今日ボタン

### CalendarList
カレンダーの一覧表示と管理機能。

**特徴:**
- マイカレンダー/共有カレンダーの分類
- 表示/非表示の切り替え
- カレンダー作成・編集・削除
- 色付きインジケーター
- ドロップダウンメニュー

### TagFilter
タグによるフィルタリング機能。

**特徴:**
- 階層構造対応
- 検索機能
- 新規タグ作成
- バッジ表示
- カウント表示

### QuickActions
よく使用するアクションへのショートカット。

**特徴:**
- 展開/コンパクトモード
- キーボードショートカット表示
- カスタムアクション対応
- ドロップダウンメニュー

## 🔧 使用方法

### 基本的な使用例

```typescript
import { Sidebar } from '@/features/calendar/components/layout/Sidebar'

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendars, setCalendars] = useState([])
  const [tags, setTags] = useState([])
  
  return (
    <div className="flex">
      <Sidebar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        calendars={calendars}
        tags={tags}
        onCreateEvent={() => {/* イベント作成処理 */}}
        onCreateTask={() => {/* タスク作成処理 */}}
      />
      <main className="flex-1">
        {/* メインコンテンツ */}
      </main>
    </div>
  )
}
```

### 個別コンポーネントの使用

```typescript
import { 
  MiniCalendar, 
  CalendarList, 
  TagFilter, 
  QuickActions 
} from '@/features/calendar/components/layout/Sidebar'

// ミニカレンダーのみ使用
<MiniCalendar
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  highlightedDates={eventDates}
  showWeekNumbers={true}
/>

// クイックアクションのみ使用
<QuickActions
  variant="compact"
  onCreateEvent={handleCreateEvent}
  onGoToToday={handleGoToToday}
/>
```

## 🎨 カスタマイズ

### 表示オプション

```typescript
<Sidebar
  // セクションの表示/非表示
  showMiniCalendar={true}
  showCalendarList={true} 
  showTagFilter={false}
  showQuickActions={true}
  
  // デフォルト展開状態
  defaultExpanded={['mini-calendar', 'quick-actions']}
  
  // 折りたたみ状態の制御
  collapsed={isCollapsed}
  onCollapsedChange={setIsCollapsed}
/>
```

### カスタムアクション

```typescript
const customActions: QuickAction[] = [
  {
    id: 'custom-report',
    label: 'レポート生成',
    icon: FileBarChart,
    shortcut: 'Ctrl+R',
    color: 'primary'
  }
]

<Sidebar
  customActions={customActions}
  onCustomAction={(actionId) => {
    if (actionId === 'custom-report') {
      generateReport()
    }
  }}
/>
```

## 🔄 状態管理

### 推奨パターン

```typescript
// サイドバーの状態をカスタムフックで管理
function useCalendarSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  
  // カレンダーデータの取得
  const { calendars } = useCalendars()
  const { tags } = useTags()
  
  return {
    // 状態
    collapsed,
    selectedDate,
    selectedCalendarIds,
    selectedTagIds,
    calendars,
    tags,
    
    // アクション
    setCollapsed,
    setSelectedDate,
    setSelectedCalendarIds,
    setSelectedTagIds,
  }
}
```

## ♿ アクセシビリティ

### 実装されている機能

- **キーボードナビゲーション**: Tab/Shift+Tab での移動
- **ARIA属性**: 適切なロール・ラベル・状態の設定
- **スクリーンリーダー対応**: 意味のある読み上げ順序
- **フォーカス管理**: 折りたたみ時のフォーカス保持
- **色以外の区別**: アイコンやラベルによる情報提供

### キーボードショートカット

| キー | 機能 |
|------|------|
| `Ctrl+N` | イベント作成 |
| `Ctrl+T` | タスク作成 |
| `T` | 今日に移動 |
| `Space/Enter` | 選択項目の実行 |
| `Arrow Keys` | カレンダー内の移動 |

## 🎯 デザインシステム

### カラーパレット

```scss
// カレンダー色
$calendar-colors: (
  'primary': '#3b82f6',
  'secondary': '#10b981', 
  'warning': '#f59e0b',
  'danger': '#ef4444'
);

// サイドバー固有
$sidebar-background: 'hsl(var(--background))';
$sidebar-border: 'hsl(var(--border))';
$sidebar-collapsed-width: '3rem';
$sidebar-expanded-width: '20rem';
```

### レスポンシブブレークポイント

```scss
// モバイル: サイドバーはオーバーレイ表示
@media (max-width: 768px) {
  .calendar-sidebar {
    position: absolute;
    z-index: 50;
  }
}

// タブレット: 常時折りたたみ
@media (max-width: 1024px) {
  .calendar-sidebar {
    width: 3rem;
  }
}
```

## 🏷️ タグ

`#sidebar` `#calendar` `#ui-components` `#typescript` `#react`