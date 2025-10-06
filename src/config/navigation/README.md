# navigation/ - ナビゲーション設定

BoxLogアプリケーションのルーティング・メニュー構造を管理します。

## 📁 ファイル構成

```
src/config/navigation/
└── config.ts  # ナビゲーション設定（メニュー構造・ページ情報）
```

## 🎯 主要な概念

### L1 Primary Navigation

BoxLogのサイドバーは3つのセクションで構成されています：

1. **Views** - データ表示形式
   - Calendar（カレンダー）
   - Board（カンバンボード）
   - Table（テーブル）
   - Stats（統計）

2. **Tools** - ツール類
   - AI assistant（AI アシスタント）
   - All tags（タグ一覧）
   - Templates（テンプレート）
   - Trash（ゴミ箱）

3. **Smart Folders** - スマートフォルダ（動的）

## 🚀 基本的な使い方

### 1. ナビゲーション構造の取得

```typescript
import { primaryNavigation } from '@/config'

// すべてのナビゲーションセクションを取得
primaryNavigation.forEach(section => {
  console.log('Section:', section.label)

  section.items.forEach(item => {
    console.log('  Item:', item.label, item.href)
  })
})
```

### 2. ページタイトル・説明の取得

```typescript
import { getPageTitle, getPageDescription } from '@/config'

// ページタイトル
const title = getPageTitle('/calendar')        // 'Calendar'
const title2 = getPageTitle('/calendar/week')  // 'Calendar' (前方一致)

// ページ説明
const desc = getPageDescription('/calendar')   // 'スケジュールと予定の管理'
```

### 3. アクティブ状態の判定

```typescript
import { isNavItemActive, primaryNavigation } from '@/config'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav>
      {primaryNavigation.map(section => (
        <div key={section.id}>
          <h3>{section.label}</h3>
          <ul>
            {section.items.map(item => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={isNavItemActive(item, pathname) ? 'active' : ''}
                >
                  <item.icon />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
```

## 📋 型定義

### NavigationItem

```typescript
interface NavigationItem {
  id: string                  // 一意のID
  label: string              // 表示名
  href: string               // リンク先
  icon: React.ComponentType  // アイコンコンポーネント
  isActive?: (pathname: string) => boolean  // カスタムアクティブ判定
  badge?: number | string    // バッジ表示（オプション）
  tooltip?: string           // ツールチップ（オプション）
}
```

### NavigationSection

```typescript
interface NavigationSection {
  id: string                  // セクションID
  label?: string             // セクション名（オプション）
  items: NavigationItem[]    // ナビゲーション項目
}
```

## 💡 実践例

### サイドバーコンポーネント

```typescript
import { primaryNavigation, isNavItemActive } from '@/config'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-gray-900">
      {primaryNavigation.map(section => (
        <section key={section.id} className="mb-8">
          {section.label && (
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {section.label}
            </h2>
          )}

          <nav>
            {section.items.map(item => {
              const isActive = isNavItemActive(item, pathname)
              const Icon = item.icon

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg
                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  `}
                  title={item.tooltip}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </section>
      ))}
    </aside>
  )
}
```

### ページタイトルの動的表示

```typescript
import { getPageTitle, getPageDescription } from '@/config'
import { usePathname } from 'next/navigation'

export function PageHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const description = getPageDescription(pathname)

  return (
    <header>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}
```

### Smart Foldersの動的追加

```typescript
import { primaryNavigation } from '@/config'
import { useSmartFolders } from '@/features/smart-folders/hooks/useSmartFolders'

export function DynamicNavigation() {
  const { folders } = useSmartFolders()

  // Smart Foldersセクションを取得
  const smartFoldersSection = primaryNavigation.find(
    section => section.id === 'smart-folders'
  )

  if (smartFoldersSection) {
    // 動的にアイテムを追加
    smartFoldersSection.items = folders.map(folder => ({
      id: folder.id,
      label: folder.name,
      href: `/smart-folders/${folder.id}`,
      icon: FolderIcon,
      badge: folder.count
    }))
  }

  return <Sidebar />
}
```

## 🆕 新しいページを追加する場合

### 1. `config.ts` にページ設定を追加

```typescript
// config.ts
export const pageConfig = {
  // ... 既存の設定
  '/new-feature': {
    title: 'New Feature',
    description: '新機能の説明'
  },
}
```

### 2. ナビゲーションアイテムを追加

```typescript
import { NewFeatureIcon } from 'lucide-react'

export const primaryNavigation: NavigationSection[] = [
  {
    id: 'tools',
    label: 'Tools',
    items: [
      // ... 既存のアイテム
      {
        id: 'new-feature',
        label: 'New Feature',
        href: '/new-feature',
        icon: NewFeatureIcon,
        isActive: (pathname) => pathname.startsWith('/new-feature'),
        tooltip: 'New feature description'
      }
    ]
  }
]
```

### 3. ページファイルを作成

```typescript
// src/app/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>New Feature</div>
}
```

## 🔗 関連ドキュメント

- [App Router - Next.js公式](https://nextjs.org/docs/app) - ルーティング基礎
- [config.ts](config.ts) - 設定ファイル本体
- [src/components/layout/](../../components/layout/) - レイアウトコンポーネント

## ❓ よくある質問

### Q1: カスタムアクティブ判定が必要な場合は？

**A**: `isActive` 関数を指定します：

```typescript
{
  id: 'settings',
  label: 'Settings',
  href: '/settings',
  icon: SettingsIcon,
  isActive: (pathname) => {
    // /settings または /settings/* でアクティブ
    return pathname === '/settings' || pathname.startsWith('/settings/')
  }
}
```

### Q2: バッジの数値はどう管理するべきか？

**A**: 状態管理（Zustand等）から動的に取得します：

```typescript
import { useNotificationStore } from '@/stores/notificationStore'

const { unreadCount } = useNotificationStore()

const notificationItem = {
  id: 'notifications',
  label: 'Notifications',
  href: '/notifications',
  icon: BellIcon,
  badge: unreadCount > 0 ? unreadCount : undefined  // 0の場合は非表示
}
```

### Q3: アイコンを変更したい場合は？

**A**: `lucide-react` から別のアイコンをインポートして置き換えます：

```typescript
import { Calendar, Home, Settings } from 'lucide-react'

const item = {
  id: 'dashboard',
  label: 'Dashboard',
  href: '/dashboard',
  icon: Home  // アイコン変更
}
```

---

**最終更新**: 2025-10-06
