# Navigation Template System

再利用可能なナビゲーションテンプレートシステム。各featureで統一されたナビゲーション体験を提供します。

## 🎯 概要

このテンプレートシステムにより：
- **統一性**: 全feature間でのナビゲーション体験統一
- **再利用性**: 共通コンポーネントの効率的な再利用
- **カスタマイズ性**: feature固有のニーズに対応
- **保守性**: 一箇所での修正で全体に反映

## 🧩 コンポーネント構成

### NavigationTemplate
メインコンテナー。全体のレイアウトと構造を管理。

```tsx
interface NavigationTemplateProps {
  sections: NavigationSection[]
  className?: string
  showHeader?: boolean
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  spacing?: 'compact' | 'normal' | 'relaxed'
}
```

### NavigationSection
セクション単位でのコンテンツ管理。タイトル、折りたたみ機能を提供。

```tsx
interface NavigationSectionProps {
  title?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  icon?: React.ComponentType<{ className?: string }>
}
```

### NavigationItem
個別のナビゲーションアイテム。リンク、ボタン、状態管理を統合。

```tsx
interface NavigationItemProps {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  badge?: string | number
  onClick?: () => void
  variant?: 'default' | 'compact' | 'minimal'
  disabled?: boolean
}
```

## 🔧 使用方法

### 基本的な使用例

```tsx
import { NavigationTemplate, NavigationSection, NavigationItem } from '@/components/layout/navigation/templates'
import { Calendar, Settings } from 'lucide-react'

function MyFeatureNavigation() {
  return (
    <NavigationTemplate
      sections={[
        {
          id: 'main',
          title: 'Views',
          items: [
            <NavigationItem
              key="overview"
              label="Overview"
              href="/my-feature"
              icon={Calendar}
              isActive={true}
            />,
            <NavigationItem
              key="details"
              label="Details"
              href="/my-feature/details"
              icon={Calendar}
              badge="5"
            />
          ]
        }
      ]}
      footerContent={
        <NavigationSection>
          <NavigationItem
            label="Settings"
            href="/my-feature/settings"
            icon={Settings}
            variant="compact"
          />
        </NavigationSection>
      }
    />
  )
}
```

### Hook使用例

```tsx
import { useNavigationTemplate } from '@/components/layout/navigation/templates/hooks/useNavigationTemplate'

function MyFeatureNavigation() {
  const { sections } = useNavigationTemplate({
    sections: [
      {
        id: 'main',
        title: 'Views',
        items: [
          {
            id: 'overview',
            label: 'Overview',
            href: '/my-feature',
            icon: Calendar,
            activePatterns: ['/my-feature', '/my-feature/dashboard']
          }
        ]
      }
    ]
  })

  // sections は自動的にアクティブ状態が計算される
  return <NavigationTemplate sections={sections} />
}
```

## 📋 スタイリングオプション

### Spacing Variants
```tsx
<NavigationTemplate spacing="compact" />   // 詰めたレイアウト
<NavigationTemplate spacing="normal" />    // 標準（デフォルト）
<NavigationTemplate spacing="relaxed" />   // ゆったり
```

### Item Variants
```tsx
<NavigationItem variant="default" />   // 標準サイズ
<NavigationItem variant="compact" />   // コンパクト
<NavigationItem variant="minimal" />   // 最小限
```

### カスタムスタイリング
すべてのコンポーネントで`className`プロパティによるカスタマイズが可能。

## 🎨 テーマ統合

テンプレートシステムは完全にBoxLogのテーマシステムと統合：

- **Colors**: `selection.*`, `text.*`, `background.*`
- **Typography**: `heading.*`
- **Spacing**: `componentRadius.*`, `animations.*`
- **Icons**: `icons.size.*`

## 📁 Feature統合パターン

### 1. 専用ナビゲーションコンポーネント作成

```tsx
// src/features/calendar/components/CalendarNavigation.tsx
import { NavigationTemplate, NavigationItem } from '@/components/layout/navigation/templates'

export function CalendarNavigation() {
  return (
    <NavigationTemplate
      sections={[/* calendar specific sections */]}
    />
  )
}
```

### 2. Layout統合

```tsx
// src/components/layout/navigation/page-content.tsx
import { CalendarNavigation } from '@/features/calendar/components/CalendarNavigation'

export function PageContent({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/calendar')) {
    return <CalendarNavigation />
  }
  // ... other features
}
```

## 📊 実装例

### Calendar機能
- Views切り替え（Week, Month, Agenda）
- フィルター（My Events, Shared）
- 設定アクセス

### Table機能  
- ビュー管理（All Tasks, Active, Completed）
- アクション（Filter, Export）
- コンパクトレイアウト

## 🔄 拡張ガイド

### 新しいバリアント追加

```tsx
// NavigationItem.tsx
const variantStyles = {
  default: 'px-3 py-2 gap-3',
  compact: 'px-2 py-1.5 gap-2 text-sm',
  minimal: 'px-1 py-1 gap-2 text-sm',
  large: 'px-4 py-3 gap-4 text-lg'  // 新規追加
}
```

### カスタムセクションタイプ

```tsx
interface CustomSectionProps extends NavigationSectionProps {
  customProp?: string
}

function CustomSection(props: CustomSectionProps) {
  // カスタムロジック
  return <NavigationSection {...props} />
}
```

## 🧪 テスト

```tsx
import { render } from '@testing-library/react'
import { NavigationTemplate } from './NavigationTemplate'

test('renders navigation sections', () => {
  const sections = [
    {
      id: 'test',
      items: [<div key="item">Test Item</div>]
    }
  ]
  
  render(<NavigationTemplate sections={sections} />)
  // assertions
})
```

## 📚 関連ドキュメント

- [Layout System](/src/components/layout/README.md)
- [Theme System](/src/config/theme/README.md)
- [Navigation Config](/src/config/navigation/README.md)

---

**Last Updated**: 2025-09-06  
**Version**: v1.0 - Initial Template System