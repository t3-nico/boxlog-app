# AppBar - コンパクトナビゲーション

64px幅のコンパクトなアプリケーション全体のナビゲーション。

## 概要

- **幅**: 64px（固定）
- **レイアウト**: アイコン（24px） + 名前（11px）の縦型
- **機能**: ページ切り替え（Calendar/Board/Table/Stats）+ アクション（Search/Theme/Notifications/Settings）

## ファイル構造

```
appbar/
├── AppBar.tsx           # メインコンポーネント
├── Account.tsx          # アカウントセクション
├── Navigation.tsx       # ビューセクション
├── Actions.tsx          # アクションセクション
├── Item.tsx             # 個別アイテム
├── types.ts             # 型定義
├── hooks/
│   └── useUserAuth.ts   # 認証hook
└── README.md            # 本ファイル
```

## 使用例

```tsx
import { AppBar } from '@/features/navigation/components/appbar';

export default function Layout() {
  return (
    <div className="flex h-screen">
      <AppBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## デザイン仕様

### スペーシング（8pxグリッド準拠）

```tsx
const spacing = {
  width: '64px', // w-16
  itemGap: '16px', // gap-4
};
```

### タイポグラフィ

```tsx
const typography = {
  iconSize: '20px', // h-5 w-5
  fontSize: '11px', // text-[11px]
  lineHeight: 'tight', // leading-tight
  textAlign: 'center', // text-center
  wordBreak: 'break-words',
};
```

### カラー（M3 State Layer準拠）

```tsx
// globals.css のセマンティックトークン使用
// M3原則: ホバー時にテキスト色は変わらない（背景オーバーレイのみ）
const colors = {
  background: 'bg-sidebar',
  text: 'text-sidebar-foreground',
  hover: 'hover:bg-primary/8', // M3: ホバー = 8%オーバーレイ
  active: 'bg-primary/12 text-primary', // M3: 選択 = 12%オーバーレイ
};

// 禁止パターン（使用禁止）
// ❌ hover:bg-accent
// ❌ hover:text-accent-foreground
// ❌ bg-accent
// ❌ text-accent-foreground
```

## コンポーネント構成

### AppBar

メインコンテナ。Account、Navigation、Actionsを統合。

### Account

ユーザーアバターとドロップダウンメニュー（アカウント設定、ヘルプ、ログアウト）。

### Navigation

ビュー切り替えナビゲーション（Calendar/Board/Table/Stats）。

### Actions

Search、Theme、Notifications、Settings のアクションボタン。

### Item

個別のナビゲーションアイテム。アイコン + 名前を縦に配置。

**Props**:

```tsx
interface ItemProps {
  icon: LucideIcon;
  label: string;
  url: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
```

## アクセシビリティ

- `role="navigation"`: ナビゲーションランドマーク
- `aria-label="Main navigation"`: スクリーンリーダー対応
- `aria-current="page"`: 現在のページを明示
- キーボードナビゲーション対応（Tabキー、Enterキー）
- フォーカスリング表示（`focus-visible:ring-2`）

## レスポンシブ対応

- **デスクトップ（lg以上）**: 常に表示
- **モバイル（lg未満）**: MobileBottomNavigationに置き換え

## 多言語対応

```tsx
// 日本語
t('sidebar.navigation.calendar'); // "カレンダー"
t('sidebar.navigation.board'); // "ボード"

// 英語
t('sidebar.navigation.calendar'); // "Calendar"
t('sidebar.navigation.board'); // "Board"
```

## テスト

```bash
# ユニットテスト
npm run test src/features/navigation/components/appbar

# ビジュアルリグレッションテスト
npm run test:visual
```

## 関連ドキュメント

- **親ディレクトリ**: [../../CLAUDE.md](../../CLAUDE.md)
- **レイアウト**: [/src/components/layout/CLAUDE.md](/src/components/layout/CLAUDE.md)

---

**最終更新**: 2025-11-27 | **バージョン**: v2.1 - M3 State Layer準拠に更新
