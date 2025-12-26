# アクセシビリティ開発ガイド

> BoxLogのアクセシビリティ対応に関する設定と基準

## 基準スコア

| ツール                 | 基準      | タイミング   |
| ---------------------- | --------- | ------------ |
| Lighthouse CI          | 95点以上  | mainマージ時 |
| eslint-plugin-jsx-a11y | エラー0件 | コミット時   |
| axe-core               | 警告確認  | 開発時       |

## 設定ファイル

### 1. Lighthouse CI

**ファイル**: `lighthouserc.cjs`

```javascript
'categories:accessibility': ['error', { minScore: 0.95 }],
```

95点未満でCIが失敗します。

### 2. ESLint jsx-a11y

**ファイル**: `.eslintrc.cjs` または `.eslint/`

jsx-a11yプラグインが有効化されています。

```bash
# チェック
npm run a11y:check

# 自動修正
npm run a11y:full
```

### 3. axe-core（開発環境）

**ファイル**: `src/components/dev/AxeAccessibilityChecker.tsx`

開発サーバー起動時に自動実行されます。
ブラウザのコンソールに問題が表示されます。

```
[axe] New axe issues found:
  - button-name: Buttons must have discernible text
```

## 実装パターン

### スクリーンリーダー用テキスト

```tsx
// アイコンボタン
<Button variant="ghost" size="icon" aria-label="設定を開く">
  <Settings />
</Button>

// 閉じるボタン
<button>
  <XIcon />
  <span className="sr-only">閉じる</span>
</button>
```

### フォーカス管理

```tsx
// フォーカス可視化（shadcn/ui標準）
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// aria-disabled対応
'aria-disabled:pointer-events-none aria-disabled:opacity-50';
```

### ライブリージョン

```tsx
// ステータス更新（polite）
<div aria-live="polite" role="status" className="sr-only">
  {message}
</div>

// 緊急通知（assertive）
<div aria-live="assertive" role="alert" className="sr-only">
  {errorMessage}
</div>
```

### スキップリンク

`src/components/layout/base-layout-content.tsx` で実装済み：

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only ..."
>
  メインコンテンツへスキップ
</a>

// ターゲット
<main id="main-content" role="main">
```

## カラーコントラスト

### セマンティックトークン使用

```tsx
// 良い例
className="text-foreground"
className="text-muted-foreground"

// 悪い例
className="text-gray-500"
style={{ color: '#666' }}
```

### WCAG AA基準

| テキストサイズ          | 最小コントラスト比 |
| ----------------------- | ------------------ |
| 通常テキスト（<18pt）   | 4.5:1              |
| 大きなテキスト（≥18pt） | 3:1                |

## チェックリスト

### 新規コンポーネント作成時

- [ ] インタラクティブ要素に `aria-label` または可視ラベルがある
- [ ] フォーカス状態が視覚的に明確
- [ ] キーボードで操作可能
- [ ] カラーコントラストがWCAG AA準拠
- [ ] `npm run a11y:check` がパス

### PR作成前

- [ ] `npm run lint` がパス
- [ ] 開発サーバーでaxe-coreの警告を確認
- [ ] Tabキーで全要素にアクセス可能

## 参考リンク

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)

## 関連ドキュメント

- [アクセシビリティ現状レポート](../operations/ACCESSIBILITY_STATUS.md)
