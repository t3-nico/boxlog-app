# Settings Layout System Implementation

## 概要
BoxLogアプリの設定ページ群に統一されたレイアウトシステムを実装し、全13個の設定ページを新しいレイアウトに移行しました。

## 実装内容

### 1. SettingsLayoutコンポーネントの作成
**ファイル**: `/src/features/settings/components/SettingsLayout.tsx`

**主な機能:**
- 統一されたヘッダー（タイトル + 説明 + アクション）
- フレックスレイアウトによる適切な高さ配分
- スクロール対応のメインコンテンツエリア
- カレンダーページと同じパディング（`columns.main.padding.md`）
- config/theme準拠の完全なテーマ対応

**インターフェース:**
```tsx
interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}
```

### 2. SettingsCardコンポーネントの作成
**ファイル**: `/src/features/settings/components/SettingsCard.tsx`

**機能:**
- 設定項目をカード形式で表示
- タイトル、説明、アクションボタンのサポート
- `noPadding`オプション
- config/theme準拠のスタイリング

### 3. 全設定ページの統一化
以下の13個の設定ページを新しいレイアウトに移行:

#### 簡素なラッパー形式 (8ページ)
- `data-export/page.tsx` - データエクスポート
- `integration/page.tsx` - 連携設定  
- `plan-billing/page.tsx` - プラン・料金
- `templates/page.tsx` - テンプレート
- `legal/page.tsx` - 法的情報
- `account/page.tsx` - アカウント
- `notifications/page.tsx` - 通知
- `calendar/page.tsx` - カレンダー
- `preferences/page.tsx` - 環境設定

#### 複雑なレイアウト変更 (2ページ)
- `tags/page.tsx` - タグ管理
  - 完全なテーマ対応（直接Tailwindクラス → theme tokens）
  - エラー状態もSettingsLayoutでラップ
  - 統計カードのtheme対応
  
- `general/page.tsx` - 一般設定
  - 既存のフォームをSettingsLayoutでラップ
  - 最大幅とレスポンシブ対応維持

#### 完全実装済み (2ページ)
- `chronotype/page.tsx` - Chronotype設定
- `trash/page.tsx` - ゴミ箱（既に対応済み）

### 4. テーマシステム準拠
**重要な原則:**
- すべてのスタイリングで`config/theme`を使用
- 直接Tailwindクラス指定を禁止
- ダークモード自動対応

**使用したテーマトークン:**
```tsx
import { colors, typography, spacing } from '@/config/theme'

// 見出し
typography.heading.h2

// テキスト色  
colors.text.primary
colors.text.muted

// 背景色
colors.background.surface
colors.background.elevated

// ボーダー
colors.border.DEFAULT
```

### 5. スクロールバー統一化
**課題**: スクロールバー背景色がメイン部分と異なっていた

**解決**: CSS-in-JSでカスタムスクロールバースタイル実装
```tsx
// ライトモード: neutral-200 (surface色と統一)
background-color: rgb(229 229 229);

// ダークモード: neutral-800 (surface色と統一)  
background-color: rgb(38 38 38);
```

### 6. パンくずリスト削除
**変更内容:**
- SettingsLayoutからbreadcrumbsプロパティを削除
- 4個の既存ページからパンくずリスト指定を除去
- よりシンプルなレイアウト構造に統一

## レイアウト構造

### 最終的なレイアウト構造
```tsx
<div className="flex-1 flex flex-col h-full bg-surface">
  {/* 固定ヘッダー */}
  <div className="flex-shrink-0 p-6 pb-4">
    <h2>タイトル</h2>
    <p>説明</p>
    {actions}
  </div>
  
  {/* スクロール可能メインコンテンツ */}
  <div className="flex-1 overflow-auto p-6 pt-0">
    <div className="max-w-6xl">
      {children}
    </div>
  </div>
</div>
```

## 統合効果

### 一貫性の向上
- 全設定ページで統一されたヘッダー構造
- カレンダーページと同じパディング・スタイリング
- テーマトークンによる色の統一管理

### 保守性の向上  
- 設定レイアウトの変更が1ファイルで完結
- theme変更時の自動追従
- 新規設定ページの簡単追加

### UX向上
- 適切なスクロール動作
- 視覚的に統一された操作体験
- ダークモード完全対応

## ファイル一覧

### 新規作成
- `/src/features/settings/components/SettingsLayout.tsx`
- `/src/features/settings/components/SettingsCard.tsx`  

### 更新したファイル (13個)
- `/src/app/(app)/settings/data-export/page.tsx`
- `/src/app/(app)/settings/integration/page.tsx`
- `/src/app/(app)/settings/plan-billing/page.tsx`
- `/src/app/(app)/settings/tags/page.tsx`
- `/src/app/(app)/settings/templates/page.tsx` 
- `/src/app/(app)/settings/legal/page.tsx`
- `/src/app/(app)/settings/general/page.tsx`
- `/src/app/(app)/settings/chronotype/page.tsx`
- `/src/app/(app)/settings/account/page.tsx`
- `/src/app/(app)/settings/notifications/page.tsx`
- `/src/app/(app)/settings/calendar/page.tsx`
- `/src/app/(app)/settings/preferences/page.tsx`
- `/src/app/(app)/settings/trash/page.tsx` (パンくず除去のみ)

## 実装日
2025-08-26

## 関連イシュー
- 設定ページの統一化とレイアウト改善
- テーマシステム準拠の徹底
- スクロールバー統一化