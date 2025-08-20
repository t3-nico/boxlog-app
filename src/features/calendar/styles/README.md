# Calendar Styles

BoxLogカレンダー機能専用のスタイルシステムです。

## 📁 ディレクトリ構成

```
src/features/calendar/styles/
├── calendar-core.css              # 基本変数・レスポンシブ・現在時刻線
├── calendar-grid.css              # グリッド詳細設定・ユーティリティクラス
├── calendar-layout.css            # スクロール・印刷・アニメーション
├── index.css                     # スタイル統合エントリーポイント
└── README.md                     # このファイル
```

## 🎯 スタイルファイルの役割

### 1. **calendar-core.css**
**カレンダーの基盤となる中核スタイル**
- 基本CSS変数定義（時間・幅・サイドバー）
- レスポンシブ対応（モバイル・タブレット・デスクトップ）
- 現在時刻線のスタイル（赤いライン + 丸マーカー）
- カレンダーグリッドの基本コンポーネント

```css
/* 基本変数 */
--calendar-hour-height: 4.5rem;
--calendar-time-column-width: 4rem;
--calendar-current-timeline: 239 68 68; /* 赤色 */

/* レスポンシブ対応 */
@media (max-width: 639px) { --calendar-hour-height: 3rem; }
```

### 2. **calendar-grid.css**
**グリッドシステムの詳細設定**
- サブ時間単位の高さ計算（30分、15分、1分単位）
- グリッド線の色設定（Compass Neutral準拠）
- ユーティリティクラス定義（高さ・幅・線色）

```css
/* calc()を使用した自動計算 */
--calendar-half-hour-height: calc(var(--calendar-hour-height) / 2);
--calendar-grid-height: calc(var(--calendar-hour-height) * 24);

/* ユーティリティクラス */
.calendar-hour-height { height: var(--calendar-hour-height); }
```

### 3. **calendar-layout.css**
**レイアウト・UX・パフォーマンス最適化**
- カスタムスクロールバー（ライト・ダークモード対応）
- 印刷時専用スタイル（色・レイアウト調整）
- カレンダー専用アニメーション（zoom、slide）
- タッチデバイス最適化・パフォーマンス向上

```css
/* スクロールバー */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }

/* アニメーション */
@keyframes calendar-zoom-in { from { transform: scale(0.95); } }
```

## 🔄 統合の仕組み

### 1. **globals.css への統合**
```css
/* src/styles/globals.css */
@import '../features/calendar/styles/index.css';
```

### 2. **index.css でのスタイル統合**
```css
/* src/features/calendar/styles/index.css */
@import './calendar-core.css';      /* 基本・レスポンシブ・現在時刻線 */
@import './calendar-grid.css';      /* グリッド・ユーティリティ */
@import './calendar-layout.css';    /* レイアウト・アニメーション */
```

## 🎨 使用方法

### CSS変数の利用
```css
.my-calendar-component {
  height: var(--calendar-hour-height);
  width: var(--calendar-time-column-width);
}
```

### ユーティリティクラス
```jsx
<div className="calendar-hour-slot calendar-time-column">
  <!-- カレンダーコンテンツ -->
</div>
```

### レスポンシブ対応
```jsx
// 自動的にレスポンシブ対応
<div style={{ height: 'var(--calendar-hour-height)' }}>
  モバイル: 3rem、タブレット: 3.75rem、デスクトップ: 4.5rem
</div>
```

## 🚀 メリット

### 1. **統一された管理**
- 全てのCalendarスタイルが`/src/features/calendar/styles/`に集約
- 機能ごとの責任が明確（基盤・グリッド・レイアウト）

### 2. **シンプルな構造**
- 複雑なディレクトリ構造を排除
- 開発者がスタイルを見つけやすい一箇所管理

### 3. **重複の完全削除**
- globals.css からCalendar変数を完全分離
- 既存の複数ファイルを統合・最適化

### 4. **段階的読み込み**
- 基盤 → グリッド詳細 → レイアウト最適化の論理的順序
- 必要に応じて個別ファイルのカスタマイズも可能

### 5. **保守性とパフォーマンス**
- Calendar固有の変更がグローバルスタイルに影響しない
- 効率的なCSSの配信とキャッシュ最適化

## 📝 開発ガイドライン

### 新しいCalendarスタイルの追加

#### 基本変数・レスポンシブ対応
1. `calendar-core.css` に基本CSS変数を追加
2. レスポンシブ設定（モバイル・タブレット・デスクトップ）
3. 現在時刻線などの基本コンポーネントスタイル

#### グリッド関連
1. `calendar-grid.css` にサブ時間単位やグリッド線色を追加
2. 新しいユーティリティクラスの定義

#### レイアウト・UX
1. `calendar-layout.css` にスクロール・印刷・アニメーションを追加
2. パフォーマンス最適化やタッチデバイス対応

### カスタマイズ
```css
/* 独自の拡張 */
:root {
  --calendar-custom-property: value;
}

/* 既存変数の上書き */
@media (min-width: 1400px) {
  :root {
    --calendar-hour-height: 5rem; /* より大きな画面では高く */
  }
}
```

## 🔧 技術仕様

### CSS変数の命名規則
```css
/* 基本パターン */
--calendar-{category}-{property}: value;

/* 例 */
--calendar-hour-height: 4.5rem;           /* 時間の高さ */
--calendar-current-timeline: 239 68 68;   /* 現在時刻線色 */
--calendar-half-hour-height: calc(...);   /* 計算された値 */
```

### レスポンシブブレークポイント
```css
/* モバイル */
@media (max-width: 639px) { /* 3rem */ }

/* タブレット */  
@media (min-width: 640px) and (max-width: 1023px) { /* 3.75rem */ }

/* デスクトップ */
@media (min-width: 1024px) { /* 4.5rem */ }
```

### Compass Neutral連携
```css
/* グリッド線にCompass Neutralを使用 */
--calendar-hour-line-color: rgb(var(--color-border));
--calendar-half-hour-line-color: rgb(var(--color-border) / 0.5);
```

---

**最終更新**: 2025-08-20  
**バージョン**: v2.0 - 統合・一元化・最適化版