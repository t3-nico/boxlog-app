---
name: a11y
description: アクセシビリティスキル。インタラクティブ要素（ボタン、フォーム、モーダル等）の実装時に自動発動。WCAG準拠とshadcn/ui（Radix UI）のa11y対応を支援。
---

# アクセシビリティ（a11y）スキル

Dayoptのアクセシビリティ対応を支援するスキル。WCAG 2.1 AA準拠を目標。

## When to Use（自動発動条件）

以下の状況で自動発動：

- ボタン、リンク、フォーム等のインタラクティブ要素実装時
- Dialog、Popover、Drawer等のモーダル系コンポーネント実装時
- カスタムコンポーネント（shadcn/ui外）の作成時
- キーボード操作の実装時
- 「アクセシビリティ」「a11y」「スクリーンリーダー」等のキーワード

## Dayoptの現状

| 項目                     | 状況                   |
| ------------------------ | ---------------------- |
| カラーコントラスト       | WCAG AAA準拠 ✅        |
| キーボードナビゲーション | Google Calendar互換 ✅ |
| ARIA属性                 | 基本的なもののみ       |
| フォーカス管理           | 部分的実装             |
| スクリーンリーダー       | 最小限度               |

## 必須チェックリスト

### 1. インタラクティブ要素

```typescript
// ✅ アイコンボタンには必ずaria-label
<Button variant="ghost" size="icon" aria-label="設定を開く">
  <SettingsIcon aria-hidden="true" />
</Button>

// ✅ 装飾アイコンはaria-hidden
<span aria-hidden="true">🎉</span>

// ✅ ローディング状態
<Button disabled aria-busy={isLoading}>
  {isLoading ? <Spinner /> : '保存'}
</Button>
```

### 2. フォーム

```typescript
// ✅ Label と Input の紐付け
<Label htmlFor="email">メールアドレス</Label>
<Input id="email" type="email" aria-describedby="email-hint" />
<p id="email-hint" className="text-sm text-muted-foreground">
  確認メールを送信します
</p>

// ✅ エラー状態
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

### 3. Dialog / AlertDialog

```typescript
// ✅ shadcn/ui の Dialog はRadix UIベースで基本対応済み
// 以下を確認：
<DialogContent>
  <DialogHeader>
    <DialogTitle>タイトル</DialogTitle>        {/* aria-labelledby 自動 */}
    <DialogDescription>説明文</DialogDescription> {/* aria-describedby 自動 */}
  </DialogHeader>
  {/* コンテンツ */}
</DialogContent>

// ⚠️ DialogTitle/DialogDescription を省略しない
// 省略するとスクリーンリーダーで内容が伝わらない
```

### 4. キーボードナビゲーション

```typescript
// ✅ Dayoptのカレンダーキーボード操作（参考）
// src/features/calendar/hooks/useCalendarPlanKeyboard.ts

// Escape: Inspectorを閉じる
// Delete/Backspace: 選択中プラン削除
// C: 新規プラン作成
// Cmd/Ctrl+C/V: コピー/ペースト

// ⚠️ 入力中はショートカット無効化
const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
if (isTyping) return;
```

### 5. フォーカス管理

```typescript
// ✅ フォーカスリング（globals.cssで定義済み）
className =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// ✅ タップターゲット最小サイズ（Apple HIG: 44x44px）
// shadcn/ui Button size="icon" で対応済み

// ⚠️ カスタム要素の場合は明示的に設定
className = 'min-h-11 min-w-11'; // 44px = 2.75rem = 11 * 4px
```

## 禁止事項

### ❌ クリックのみでキーボード操作不可

```typescript
// ❌ 禁止（div + onClick のみ）
<div onClick={handleClick}>クリック</div>

// ✅ 正しい（button または role + tabIndex + onKeyDown）
<button onClick={handleClick}>クリック</button>

// または
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  クリック
</div>
```

### ❌ aria-label の乱用

```typescript
// ❌ 禁止（テキストがあるのにaria-label）
<Button aria-label="保存する">保存</Button>

// ✅ 正しい（テキストがない場合のみ）
<Button aria-label="保存する">
  <SaveIcon aria-hidden="true" />
</Button>
```

### ❌ 色だけで情報を伝える

```typescript
// ❌ 禁止（赤色だけでエラーを示す）
<span className="text-red-500">必須</span>

// ✅ 正しい（アイコンやテキストも併用）
<span className="text-destructive">
  <AlertIcon aria-hidden="true" /> 必須
</span>
```

## shadcn/ui コンポーネント別ガイド

### 基本対応済み（そのまま使用可）

| コンポーネント | a11y対応                             |
| -------------- | ------------------------------------ |
| Button         | disabled, aria-busy対応              |
| Input          | aria-invalid対応                     |
| Select         | Radix UI（キーボード操作完備）       |
| Dialog         | role, aria-modal, フォーカストラップ |
| AlertDialog    | 同上                                 |
| Popover        | Radix UI（Escape で閉じる）          |
| Drawer         | role="dialog"                        |

### 追加対応が必要

| コンポーネント         | 必要な対応                    |
| ---------------------- | ----------------------------- |
| Toast                  | aria-live="polite" の確認     |
| カスタムドロップダウン | キーボード操作の実装          |
| Drag & Drop            | aria-grabbed, aria-dropeffect |

## テストツール

### 開発中の自動チェック

```typescript
// src/components/debug/AxeAccessibilityChecker.tsx が存在
// 開発環境で自動的にa11y違反を検出
```

### 手動テスト

1. **キーボードのみ操作**: マウスを使わずに全機能が使えるか
2. **Tab順序**: 論理的な順序でフォーカスが移動するか
3. **スクリーンリーダー**: VoiceOver（Mac）で内容が伝わるか

## Motion Preference

```typescript
// ✅ Dayoptは対応済み
// src/hooks/useReducedMotion.ts

// アニメーションを減らしたい設定を尊重
const prefersReducedMotion = useReducedMotion();
```

## 関連ファイル

- `src/hooks/useReducedMotion.ts` - モーション設定
- `src/features/calendar/hooks/useCalendarPlanKeyboard.ts` - キーボードショートカット
- `src/components/debug/AxeAccessibilityChecker.tsx` - a11yチェッカー
- `docs/design-system/STYLE_GUIDE.md` - カラーコントラスト定義

## 関連スキル

- `/react-best-practices` - パフォーマンスとa11yの両立
- `/frontend-design` - UI設計とa11y
- `/security` - セキュリティとa11yの両立
