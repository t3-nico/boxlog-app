# Calendar Development Guide

カレンダー機能の開発に関するガイドラインとベストプラクティス

## 🎯 開発方針

### 基本原則

1. **レスポンシブデザイン**: 全デバイスでの最適な表示
2. **アクセシビリティファースト**: WCAG 2.1 AAA準拠
3. **パフォーマンス重視**: 大量データでもスムーズな動作
4. **型安全性**: TypeScriptを活用した堅牢な実装

### コーディング規約

- **shadcn/ui優先**: UIコンポーネントの第一選択
- **8pxグリッドシステム**: デザインシステムに準拠
- **ダークモード対応**: ライト・ダーク両方をサポート
- **レスポンシブ**: モバイルファーストアプローチ

## 🏗️ 開発ワークフロー

### 新機能開発フロー

1. **要件定義**
   - ユーザーストーリーの作成
   - 技術仕様の検討
   - アクセシビリティ要件の確認

2. **設計フェーズ**
   - コンポーネント設計
   - 型定義の作成
   - パフォーマンス考慮事項の検討

3. **実装フェーズ**
   - TypeScriptでの実装
   - 単体テストの作成
   - アクセシビリティテストの実施

4. **テスト・検証**
   - 型チェックの実行
   - リンティングの実行
   - 手動テストの実施

### ブランチ戦略

```
feature/calendar-new-feature
├── dev (マージ先)
└── main (本番)
```

## 🧩 コンポーネント開発

### 新しいビューコンポーネントの作成

```typescript
// views/NewView/index.tsx
'use client'

import { memo } from 'react'
import { CalendarViewProps } from '@/features/calendar/types/calendar.types'

interface NewViewProps extends CalendarViewProps {
  // 追加のprops定義
}

export const NewView = memo<NewViewProps>(({
  className,
  // その他のprops
}) => {
  return (
    <div
      className={cn("calendar-new-view", className)}
      role="grid"
      aria-label="新しいカレンダービュー"
    >
      {/* 実装内容 */}
    </div>
  )
})

NewView.displayName = 'NewView'
```

### インタラクション機能の追加

```typescript
// interactions/NewInteraction.tsx
'use client'

import { useCallback, useEffect } from 'react'

export function useNewInteraction() {
  const handleInteraction = useCallback(() => {
    // インタラクション処理
  }, [])

  useEffect(() => {
    // イベントリスナーの設定
    return () => {
      // クリーンアップ
    }
  }, [])

  return {
    handleInteraction,
  }
}
```

## ⚡ パフォーマンス最適化

### 必須の最適化パターン

1. **メモ化の活用**

```typescript
import { memo, useMemo, useCallback } from 'react'

const OptimizedComponent = memo(({ data, onChange }) => {
  const processedData = useMemo(() =>
    heavyCalculation(data), [data]
  )

  const handleChange = useCallback((value) =>
    onChange(value), [onChange]
  )

  return <div>{/* コンポーネント内容 */}</div>
})
```

2. **仮想化の実装**

```typescript
import { VirtualCalendarGrid } from '../common/virtualization/VirtualCalendarGrid'

// 大量データ表示時
<VirtualCalendarGrid
  items={largeDataSet}
  itemHeight={HOUR_HEIGHT}
  renderItem={({ item, index }) => <EventBlock {...item} />}
/>
```

3. **遅延ローディング**

```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() =>
  import('./HeavyComponent').then(mod => ({ default: mod.HeavyComponent }))
)

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### パフォーマンス測定

```bash
# パフォーマンステスト実行
PERFORMANCE_TEST=true npm run dev

# メモリ使用量監視
MEMORY_MONITOR=true npm run dev
```

## ♿ アクセシビリティ

### 必須のアクセシビリティ実装

1. **キーボード操作**

```typescript
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      navigateLeft()
      break
    case 'ArrowRight':
      navigateRight()
      break
    case 'Enter':
    case ' ':
      selectItem()
      break
  }
}, [])
```

2. **ARIA属性の設定**

```jsx
<div role="grid" aria-label="カレンダー" aria-rowcount={rowCount} aria-colcount={colCount}>
  <div role="gridcell" aria-selected={isSelected} aria-label={ariaLabel} tabIndex={isSelected ? 0 : -1}>
    {content}
  </div>
</div>
```

3. **フォーカス管理**

```typescript
// Radix UI Dialogを使用（フォーカストラップ内蔵）
import * as Dialog from '@radix-ui/react-dialog'

const Component = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>開く</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-overlay" />
        <Dialog.Content>
          {/* フォーカストラップされたコンテンツ */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### アクセシビリティテスト

```bash
# アクセシビリティテスト実行
npm run test:a11y

# スクリーンリーダーテスト
SCREEN_READER_TEST=true npm run dev
```

## 🧪 テスト

### テスト戦略

1. **単体テスト**: 各コンポーネントの動作検証
2. **統合テスト**: コンポーネント間の連携検証
3. **E2Eテスト**: ユーザーシナリオの検証
4. **アクセシビリティテスト**: WCAG準拠の検証

### テスト実装例

```typescript
// __tests__/CalendarView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarView } from '../CalendarView'

describe('CalendarView', () => {
  test('正しく表示される', () => {
    render(<CalendarView initialViewType="day" />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  test('キーボード操作が動作する', () => {
    render(<CalendarView initialViewType="day" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    // アサーション
  })
})
```

## 🔧 デバッグ

### デバッグツール

1. **開発者ツール拡張**

```typescript
// カレンダー専用のデバッグ情報
if (process.env.NODE_ENV === 'development') {
  window.__CALENDAR_DEBUG__ = {
    currentView,
    selectedEvents,
    performanceMetrics,
  }
}
```

2. **ログ出力**

```typescript
import { debugLog } from '../utils/debug'

// 開発環境でのみ出力
debugLog('calendar', 'View changed to:', newView)
```

3. **パフォーマンス監視**

```typescript
import { PerformanceMonitor } from '../utils/performance/PerformanceMonitor'

const monitor = new PerformanceMonitor('CalendarView')
monitor.start()
// 処理実行
monitor.end()
```

## 📦 依存関係管理

### 推奨ライブラリ

1. **UIコンポーネント**
   - `@radix-ui/*`: ヘッドレスUI（shadcn/ui経由）
   - `lucide-react`: アイコン
   - `clsx`: クラス名条件付き適用

2. **日付処理**
   - `date-fns`: 日付操作ユーティリティ
   - `date-fns-tz`: タイムゾーン処理

3. **アニメーション**
   - `framer-motion`: アニメーションライブラリ

### 追加依存関係のガイドライン

- 新しい依存関係追加時は必ずチーム承認を得る
- バンドルサイズへの影響を検証する
- TypeScript対応状況を確認する
- アクセシビリティサポートを確認する

## 🚀 デプロイ

### デプロイ前チェックリスト

- [ ] `npm run typecheck` が成功する
- [ ] `npm run lint` でエラーがない
- [ ] アクセシビリティテストをパスする
- [ ] 全主要ブラウザでテスト済み
- [ ] モバイルデバイスでテスト済み
- [ ] パフォーマンステストをパスする

### 環境別設定

```typescript
// 環境別の設定
const config = {
  development: {
    debug: true,
    performanceMonitoring: true,
  },
  production: {
    debug: false,
    performanceMonitoring: false,
  },
}
```

## 📝 コミット

### コミットメッセージ規約

```
feat(calendar): 新しいビューコンポーネントを追加
fix(calendar): イベントドラッグ時の位置計算を修正
perf(calendar): 仮想化による大量データ表示最適化
a11y(calendar): スクリーンリーダー対応を改善
test(calendar): CalendarViewの単体テスト追加
docs(calendar): コンポーネント設計ドキュメント更新
```

## 🏷️ タグ

`#development` `#guidelines` `#calendar` `#best-practices` `#typescript`
