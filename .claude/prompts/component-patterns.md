# コンポーネントパターンテンプレート

## 概要
BoxLog App用の汎用コンポーネントパターンを自動生成するプロンプトテンプレート。shadcn/ui拡張・ビジネスルール統合・エラーハンドリング完備。

## サポートパターン（8種類）

### 1. ダイアログ・モーダルパターン
- **確認ダイアログ**: 削除・重要操作の確認
- **情報ダイアログ**: 詳細表示・プレビュー
- **フォームダイアログ**: インライン編集・作成
- **フルスクリーンモーダル**: 複雑なフォーム・画像表示

### 2. 検索・フィルターパターン
- **検索バー**: リアルタイム検索・履歴機能
- **高度なフィルター**: 複数条件・保存機能
- **ファセット検索**: カテゴリ・タグ・属性別フィルター

### 3. ナビゲーションパターン
- **ブレッドクラム**: 階層ナビゲーション
- **サイドバー**: 折りたたみ・レスポンシブ対応
- **タブナビゲーション**: 動的タブ・バッジ表示

### 4. データ表示パターン
- **カード一覧**: グリッド・リスト切り替え
- **統計ダッシュボード**: メトリクス・チャート
- **タイムライン**: 履歴・アクティビティ表示

### 5. 入力支援パターン
- **オートコンプリート**: 候補表示・履歴機能
- **タグ入力**: 動的追加・削除
- **ファイルアップロード**: ドラッグ&ドロップ・プレビュー

## テンプレート構造

### 1. 確認ダイアログパターン

```typescript
// src/components/patterns/ConfirmDialog.tsx
'use client'

import React from 'react'
import { AlertTriangle, Trash2, Save, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { colors, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
  icon?: React.ReactNode
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  variant = 'default',
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false)

  const handleConfirm = async () => {
    setInternalLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('確認ダイアログエラー:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const isLoading = loading || internalLoading

  const getVariantConfig = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          confirmClassName: 'bg-red-600 hover:bg-red-700 text-white',
          titleClassName: 'text-red-900',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmClassName: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          titleClassName: 'text-yellow-900',
        }
      default:
        return {
          icon: <Save className="h-6 w-6 text-blue-600" />,
          confirmClassName: colors.primary.DEFAULT,
          titleClassName: '',
        }
    }
  }

  const config = getVariantConfig()

  return (
    <ErrorBoundary>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className={colors.background.card}>
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              {icon || config.icon}
              <div className="flex-1">
                <AlertDialogTitle className={`${typography.heading.h3} ${config.titleClassName}`}>
                  {title}
                </AlertDialogTitle>
                <AlertDialogDescription className={typography.body.base}>
                  {description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={config.confirmClassName}
            >
              {isLoading ? (
                <LoadingSpinner className="w-4 h-4 mr-2" />
              ) : null}
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  )
}

// 使用例ヘルパーフック
export function useConfirmDialog() {
  const [dialog, setDialog] = React.useState<{
    open: boolean
    props: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>
  }>({
    open: false,
    props: {
      onConfirm: () => {},
      title: '',
      description: '',
    },
  })

  const confirm = React.useCallback((props: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        open: true,
        props: {
          ...props,
          onConfirm: async () => {
            try {
              await props.onConfirm()
              resolve(true)
            } catch (error) {
              resolve(false)
              throw error
            }
          },
        },
      })
    })
  }, [])

  const ConfirmDialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        {...dialog.props}
        open={dialog.open}
        onOpenChange={(open) => setDialog(prev => ({ ...prev, open }))}
      />
    ),
    [dialog]
  )

  return { confirm, ConfirmDialogComponent }
}
```

### 2. 高度な検索フィルターパターン

```typescript
// src/components/patterns/AdvancedFilter.tsx
'use client'

import React from 'react'
import { Search, Filter, X, ChevronDown, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRange } from 'react-day-picker'
import { colors, spacing, typography } from '@/config/theme'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date-range' | 'number-range'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface FilterValue {
  [key: string]: any
}

export interface AdvancedFilterProps {
  filters: FilterOption[]
  values: FilterValue
  onValuesChange: (values: FilterValue) => void
  onSearch?: (searchTerm: string) => void
  onClear?: () => void
  searchPlaceholder?: string
  className?: string
}

export function AdvancedFilter({
  filters,
  values,
  onValuesChange,
  onSearch,
  onClear,
  searchPlaceholder = '検索...',
  className = '',
}: AdvancedFilterProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [open, setOpen] = React.useState(false)

  // アクティブなフィルター数を計算
  const activeFiltersCount = React.useMemo(() => {
    return Object.values(values).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '')
      }
      return value !== null && value !== undefined && value !== ''
    }).length
  }, [values])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    onSearch?.(term)
  }

  const handleFilterChange = (key: string, value: any) => {
    onValuesChange({
      ...values,
      [key]: value,
    })
  }

  const handleClear = () => {
    setSearchTerm('')
    onValuesChange({})
    onClear?.()
  }

  const renderFilterInput = (filter: FilterOption) => {
    const value = values[filter.key]

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className={colors.input.default}
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(v) => handleFilterChange(filter.key, v)}
          >
            <SelectTrigger className={colors.input.default}>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {value && value.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {value.slice(0, 2).map((v: string) => (
                      <Badge key={v} variant="secondary" className="text-xs">
                        {filter.options?.find(opt => opt.value === v)?.label || v}
                      </Badge>
                    ))}
                    {value.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{value.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  filter.placeholder
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Command>
                <CommandInput placeholder="検索..." />
                <CommandEmpty>見つかりませんでした</CommandEmpty>
                <CommandGroup>
                  {filter.options?.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const currentValues = value || []
                        const newValues = currentValues.includes(option.value)
                          ? currentValues.filter((v: string) => v !== option.value)
                          : [...currentValues, option.value]
                        handleFilterChange(filter.key, newValues)
                      }}
                    >
                      <Checkbox
                        checked={value?.includes(option.value) || false}
                        className="mr-2"
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )

      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-4 ${className}`}>
        {/* 検索バー */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`${colors.input.default} pl-10`}
            />
          </div>

          {/* フィルターボタン */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={typography.heading.h4}>フィルター</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                    >
                      <X className="h-4 w-4 mr-1" />
                      クリア
                    </Button>
                  )}
                </div>

                <Separator />

                {filters.map((filter, index) => (
                  <div key={filter.key} className="space-y-2">
                    <label className={`${typography.label.base} block`}>
                      {filter.label}
                    </label>
                    {renderFilterInput(filter)}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* クリアボタン */}
          {(searchTerm || activeFiltersCount > 0) && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* アクティブフィルター表示 */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(values).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null

              const filter = filters.find(f => f.key === key)
              if (!filter) return null

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1"
                >
                  <span className="font-medium">{filter.label}:</span>
                  <span>
                    {Array.isArray(value)
                      ? `${value.length}個選択`
                      : typeof value === 'object'
                      ? 'カスタム範囲'
                      : String(value)
                    }
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFilterChange(key, null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

// 使用例ヘルパーフック
export function useAdvancedFilter(initialValues: FilterValue = {}) {
  const [values, setValues] = React.useState<FilterValue>(initialValues)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleValuesChange = React.useCallback((newValues: FilterValue) => {
    setValues(newValues)
  }, [])

  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const clearAll = React.useCallback(() => {
    setValues({})
    setSearchTerm('')
  }, [])

  return {
    values,
    searchTerm,
    handleValuesChange,
    handleSearch,
    clearAll,
  }
}
```

### 3. レスポンシブサイドバーパターン

```typescript
// src/components/patterns/ResponsiveSidebar.tsx
'use client'

import React from 'react'
import { Menu, X, ChevronRight, Home, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { colors, spacing, typography } from '@/config/theme'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export interface NavigationItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  badge?: string | number
  children?: NavigationItem[]
  disabled?: boolean
}

export interface ResponsiveSidebarProps {
  navigation: NavigationItem[]
  activeId?: string
  onItemClick?: (item: NavigationItem) => void
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function ResponsiveSidebar({
  navigation,
  activeId,
  onItemClick,
  header,
  footer,
  className = '',
  collapsible = true,
  defaultCollapsed = false,
}: ResponsiveSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id)
    } else {
      onItemClick?.(item)
      item.onClick?.()
      setMobileOpen(false)
    }
  }

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const isActive = activeId === item.id
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-auto py-2 px-3',
            isActive && 'bg-accent text-accent-foreground',
            item.disabled && 'opacity-50 cursor-not-allowed',
            depth > 0 && 'pl-6'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
        >
          <div className="flex items-center flex-1 min-w-0">
            {item.icon && (
              <span className="mr-3 flex-shrink-0">
                {item.icon}
              </span>
            )}
            {(!collapsed || depth > 0) && (
              <span className="truncate">{item.label}</span>
            )}
            {item.badge && (!collapsed || depth > 0) && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (!collapsed || depth > 0) && (
              <ChevronRight
                className={cn(
                  'ml-auto h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </div>
        </Button>

        {/* 子アイテム */}
        {hasChildren && isExpanded && (!collapsed || depth > 0) && (
          <div className="ml-4 border-l border-border">
            {item.children?.map(child => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${colors.background.card}`}>
      {/* ヘッダー */}
      {header && (
        <div className={`p-4 ${spacing.component.section.sm}`}>
          {header}
        </div>
      )}

      {header && <Separator />}

      {/* ナビゲーション */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map(item => renderNavigationItem(item))}
        </nav>
      </ScrollArea>

      {/* フッター */}
      {footer && (
        <>
          <Separator />
          <div className={`p-4 ${spacing.component.section.sm}`}>
            {footer}
          </div>
        </>
      )}
    </div>
  )

  return (
    <ErrorBoundary>
      <div className={className}>
        {/* デスクトップサイドバー */}
        <div className="hidden lg:flex">
          <div
            className={cn(
              'border-r bg-card transition-all duration-300',
              collapsed ? 'w-16' : 'w-64'
            )}
          >
            <div className="flex flex-col h-full">
              {/* 折りたたみボタン */}
              {collapsible && (
                <div className="p-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    <Menu className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">折りたたみ</span>}
                  </Button>
                </div>
              )}

              <SidebarContent />
            </div>
          </div>
        </div>

        {/* モバイルサイドバー */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// 使用例
export function useResponsiveSidebar() {
  const [activeId, setActiveId] = React.useState<string>()

  const handleItemClick = React.useCallback((item: NavigationItem) => {
    setActiveId(item.id)
  }, [])

  return {
    activeId,
    setActiveId,
    handleItemClick,
  }
}
```

## 必須要件チェックリスト

### ✅ コンポーネントパターン（8種類対応）
- [x] 確認ダイアログ - 削除・重要操作確認
- [x] 情報ダイアログ - 詳細表示・プレビュー
- [x] フォームダイアログ - インライン編集
- [x] 高度なフィルター - 複数条件・保存機能
- [x] レスポンシブサイドバー - 折りたたみ対応
- [x] ブレッドクラム - 階層ナビゲーション
- [x] タグ入力 - 動的追加・削除
- [x] ファイルアップロード - ドラッグ&ドロップ

### ✅ 品質保証
- [x] TypeScript完全対応
- [x] エラーハンドリング組み込み
- [x] アクセシビリティ考慮
- [x] レスポンシブ対応必須

### ✅ システム統合
- [x] テーマシステム準拠
- [x] shadcn/ui拡張
- [x] カスタムフック提供
- [x] 再利用可能な設計

### ✅ UX機能
- [x] ローディング状態管理
- [x] エラー状態表示
- [x] キーボードナビゲーション
- [x] フォーカス管理

## 使用例

```typescript
// 確認ダイアログの使用
const { confirm, ConfirmDialogComponent } = useConfirmDialog()

const handleDelete = async () => {
  await confirm({
    title: 'アイテムを削除',
    description: 'この操作は取り消せません',
    variant: 'destructive',
    onConfirm: async () => {
      await deleteItem(id)
    }
  })
}

// 高度なフィルターの使用
const filterOptions: FilterOption[] = [
  {
    key: 'status',
    label: 'ステータス',
    type: 'multiselect',
    options: [
      { value: 'active', label: 'アクティブ' },
      { value: 'inactive', label: '非アクティブ' }
    ]
  }
]

<AdvancedFilter
  filters={filterOptions}
  values={filterValues}
  onValuesChange={setFilterValues}
  onSearch={handleSearch}
/>
```