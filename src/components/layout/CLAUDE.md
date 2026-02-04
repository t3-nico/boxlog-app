# layout/ - レイアウトコンポーネント

BoxLogアプリケーション全体の基盤レイアウト構造を管理するコンポーネント群。

## 🎯 このディレクトリの責務

**アプリケーション全体のレイアウト構造のみを担当**

- ✅ デスクトップ/モバイルレイアウトの切り替え
- ✅ サイドバー・ヘッダー・メインコンテンツの配置
- ✅ レスポンシブデザインの実装
- ✅ overflow管理（main要素）
- ❌ **ビジネスロジック** → 各featuresへ
- ❌ **状態管理の実装** → 各featuresへ（状態の使用は可）

## 📁 ファイル構造

```
src/components/layout/
├── base-layout.tsx              # ルートレイアウト（Server Component）
├── base-layout-content.tsx      # レイアウトオーケストレーター（Client Component）
├── desktop-layout.tsx           # デスクトップレイアウト
├── mobile-layout.tsx            # モバイルレイアウト
├── main-content-wrapper.tsx     # メインコンテンツ + Inspector
├── floating-action-button.tsx   # FAB（新規イベント作成）
└── CLAUDE.md                    # 本ドキュメント
```

## 🏗️ アーキテクチャ

### レイヤー構造

```
┌─────────────────────────────────────────┐
│ BaseLayout (Server Component)           │  ← ProvidersとBaseLayoutContentを統合
│  ├── Providers                           │
│  └── BaseLayoutContent (Client)         │  ← オーケストレーションのみ
│       ├── DesktopLayout / MobileLayout  │  ← デバイス別レイアウト
│       │    ├── Sidebar                   │
│       │    ├── SiteHeader                │
│       │    └── MainContentWrapper        │  ← main + Inspector
│       │         ├── main (各ページ)      │
│       │         └── Inspector             │
│       ├── FloatingActionButton           │  ← FAB
│       ├── SettingsDialog                 │  ← 設定ダイアログ
│       ├── CookieConsentBanner            │  ← Cookie同意バナー
│       └── MobileBottomNavigation         │  ← モバイルボトムナビ
└─────────────────────────────────────────┘
```

### コンポーネント責務分離

| コンポーネント               | 責務                                        | 依存する状態         |
| ---------------------------- | ------------------------------------------- | -------------------- |
| `base-layout.tsx`            | Server Component、Providersのラップ         | なし                 |
| `base-layout-content.tsx`    | レイアウト切り替え、共通UI配置              | 複数のhooks          |
| `desktop-layout.tsx`         | デスクトップレイアウト構造                  | `useSidebarStore`    |
| `mobile-layout.tsx`          | モバイルレイアウト構造                      | `useSidebarStore`    |
| `main-content-wrapper.tsx`   | main要素とInspectorの並列配置、overflow管理 | なし（構造のみ）     |
| `floating-action-button.tsx` | FAB UI + イベント作成トリガー               | `useCreateInspector` |

## 📖 各コンポーネント詳細

### 1. base-layout.tsx（Server Component）

アプリケーション全体のルートレイアウト。

```tsx
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <Providers>
      <BaseLayoutContent>{children}</BaseLayoutContent>
    </Providers>
  );
}
```

**特徴**:

- Server Componentとして動作
- ProvidersとClient Componentの境界を明確化
- ビジネスロジックを含まない

**使用箇所**: `src/app/[locale]/layout.tsx`

### 2. base-layout-content.tsx（Client Component）

レイアウトのオーケストレーター。デバイス判定、共通UI配置のみを担当。

```tsx
export function BaseLayoutContent({ children }: BaseLayoutContentProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const content = (
    <div className="flex h-screen flex-col">
      <a href="#main-content">スキップリンク</a>

      <div className="bg-secondary flex flex-1 overflow-hidden">
        {isMobile ? (
          <MobileLayout>{children}</MobileLayout>
        ) : (
          <DesktopLayout locale={locale}>{children}</DesktopLayout>
        )}
      </div>

      <FloatingActionButton locale={locale} />
      <SettingsDialog />
      <CookieConsentBanner />
      {isMobile && <MobileBottomNavigation />}
    </div>
  );

  // カレンダーページの場合はProviderでラップ
  return calendarProviderProps ? (
    <CalendarNavigationProvider {...calendarProviderProps}>{content}</CalendarNavigationProvider>
  ) : (
    content
  );
}
```

**責務**:

- ✅ デスクトップ/モバイル切り替え
- ✅ 共通UI要素の配置
- ✅ カレンダープロバイダーのラップ
- ❌ 具体的なレイアウト構造（DesktopLayout/MobileLayoutに委譲）

**リファクタリングのポイント**:

- 162行 → 68行に削減
- レイアウト構造を子コンポーネントに委譲
- オーケストレーションのみに責務を限定

### 3. desktop-layout.tsx

デスクトップ用レイアウト構造（Resizableサイドバー + メインコンテンツ）。

```tsx
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  const { isOpen } = useSidebarStore();

  return (
    <ResizablePanelGroup direction="horizontal">
      {isOpen && (
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <AppSidebar />
        </ResizablePanel>
      )}
      {isOpen && <ResizableHandle />}

      <ResizablePanel>
        <div className="bg-muted relative flex h-full flex-1 flex-col shadow-lg">
          <SiteHeader />
          <MainContentWrapper>{children}</MainContentWrapper>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

**特徴**:

- Resizableなサイドバー
- サイドバー開閉状態に応じた表示切り替え
- メインコンテンツとInspectorの統合（MainContentWrapperに委譲）

### 4. mobile-layout.tsx

モバイル用レイアウト構造（Sheet（オーバーレイ）サイドバー + メインコンテンツ）。

```tsx
export function MobileLayout({ children }: MobileLayoutProps) {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <div className="bg-muted flex h-full flex-1 flex-col">
        <SiteHeader />
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  );
}
```

**特徴**:

- Sheet（オーバーレイ）でサイドバー表示
- 横スクロール防止
- タッチジェスチャー対応

### 5. main-content-wrapper.tsx

main要素とInspectorの並列配置、overflow管理を担当。

```tsx
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <div className="flex flex-1">
      <main id="main-content" className="relative flex-1" role="main">
        {children}
      </main>
      <Inspector />
    </div>
  );
}
```

**設計方針**:

- overflow設定を強制しない（各ページで自由に設定可能）
- Inspectorとの並列配置を管理
- シンプルなレイアウト構造

**主な問題の解決**:

- Kanbanボードの横スクロール問題 → main要素でoverflow-x-autoを各ページで設定
- Calendarのスクロール問題 → main要素でoverflow-y-autoを各ページで設定

### 6. floating-action-button.tsx

Floating Action Button（FAB）、新規イベント作成を開始。

```tsx
export function FloatingActionButton({ locale }: FloatingActionButtonProps) {
  const { t } = useI18n(locale);
  const { openCreateInspector } = useCreateEventInspector();

  const handleCreateEventClick = useCallback(() => {
    openCreateInspector({ context: { source: 'fab' } });
  }, [openCreateInspector]);

  return (
    <Button
      onClick={handleCreateEventClick}
      size="icon"
      aria-label={t('common.createNewEvent')}
      className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-2xl shadow-lg md:bottom-6 md:right-6 md:h-16 md:w-16 lg:hidden"
    >
      <Plus className="h-6 w-6 md:h-7 md:w-7" />
    </Button>
  );
}
```

**特徴**:

- モバイル・タブレット（lg未満）のみ表示
- `useCreateEventInspector`でInspectorを開く
- jsx-no-bind対策済み（useCallback）

## 🎨 スタイリング

### 8pxグリッドシステム（必須遵守）

```tsx
// ✅ 正しい：8の倍数
<div className="p-4 gap-4 rounded-2xl">  {/* 16px, 16px, 16px */}
<div className="p-8 gap-8 rounded-3xl">  {/* 32px, 32px, 24px */}

// ❌ 禁止：8の倍数以外
<div className="p-[13px] gap-[25px]">
```

### セマンティックトークン（必須）

```tsx
// ✅ 正しい：globals.css のセマンティックトークン
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border-border">
<div className="bg-muted text-muted-foreground">

// ❌ 禁止：カスタム値、直接指定
<div className="bg-[#ffffff] text-[#000000]">
<div className="bg-white dark:bg-gray-900">
```

### レスポンシブブレークポイント

```tsx
// Tailwind CSS デフォルト
sm: 640px   // モバイル（大）
md: 768px   // タブレット
lg: 1024px  // デスクトップ（小）
xl: 1280px  // デスクトップ（大）
```

**デバイス判定**:

```tsx
const isMobile = useMediaQuery('(max-width: 768px)'); // md未満
```

## 🚨 重要な設計原則

### 1. コロケーション（Colocation）

関連するファイルは同じディレクトリに配置。

```
✅ 正しい：
layout/
├── desktop-layout.tsx
├── mobile-layout.tsx
├── main-content-wrapper.tsx
└── CLAUDE.md

❌ 誤り：
components/
├── desktop-layout.tsx
layouts/
├── mobile-layout.tsx
```

### 2. 単一責任の原則（SRP）

1つのコンポーネントは1つの責務のみを持つ。

```tsx
// ✅ 正しい：レイアウト構造のみ
export function DesktopLayout({ children }) {
  return <ResizablePanelGroup>...</ResizablePanelGroup>;
}

// ❌ 誤り：ビジネスロジック + レイアウト
export function DesktopLayout({ children }) {
  const { tasks, fetchTasks } = useTaskStore();
  useEffect(() => {
    fetchTasks();
  }, []);
  return <ResizablePanelGroup>...</ResizablePanelGroup>;
}
```

### 3. Server/Client境界の明確化

Server ComponentとClient Componentを明確に分離。

```tsx
// ✅ 正しい：Server Component
// base-layout.tsx
export function BaseLayout({ children }) {
  return (
    <Providers>
      <BaseLayoutContent>{children}</BaseLayoutContent>
    </Providers>
  );
}

// ✅ 正しい：Client Component
// base-layout-content.tsx
('use client');
export function BaseLayoutContent({ children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return <div>{isMobile ? <MobileLayout /> : <DesktopLayout />}</div>;
}
```

### 4. overflow管理の柔軟性

main要素のoverflowは各ページで制御。

```tsx
// ✅ 正しい：main要素はoverflowを強制しない
export function MainContentWrapper({ children }) {
  return (
    <div className="flex flex-1">
      <main className="relative flex-1">{children}</main>
      <Inspector />
    </div>
  )
}

// 各ページで必要に応じてoverflow設定
// src/app/[locale]/kanban/page.tsx
<main className="overflow-x-auto">...</main>

// src/app/[locale]/calendar/page.tsx
<main className="overflow-y-auto">...</main>
```

## 🔗 関連ドキュメント

- **親ディレクトリ**: [../CLAUDE.md](../CLAUDE.md) - UI実装ルール
- **ナビゲーション**: [../../features/navigation/CLAUDE.md](../../features/navigation/CLAUDE.md) - サイドバー・ヘッダー
- **Inspector**: [../../features/inspector/CLAUDE.md](../../features/inspector/CLAUDE.md) - Inspector機能
- **デザインシステム**: Storybook（`npm run storybook` → Docs/StyleGuide, Tokens/\*）

---

**📖 最終更新**: 2025-10-16 | **バージョン**: v1.0 - 初版作成（base-layout-content.tsxリファクタリング）
