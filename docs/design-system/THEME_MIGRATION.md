# BoxLog テーマシステム移行ガイド

## 📋 現状と目標

### **現状**

- 70+ファイルで直接Tailwindクラス使用
- テーマシステム（`@/config/theme`）が未活用
- ダークモード対応が個別実装

### **目標**

- 全ファイルでテーマシステム使用
- 統一されたデザイン言語
- 自動ダークモード対応

## 🎯 段階的移行戦略

### **Phase 1: ルール有効化（完了）**

- ✅ ESLintカスタムルール有効化
- ✅ 開発環境：警告レベル
- ✅ 本番環境：エラーレベル

### **Phase 2: 重要ファイル修正（進行中）**

- ✅ `src/app/error/page.tsx` 修正完了
- 🔄 次の優先ファイル：
  - `src/app/layout.tsx`
  - `src/components/shadcn-ui/button.tsx`
  - `src/features/auth/components/AuthForm.tsx`

### **Phase 3: 機能別修正**

- 認証関連
- メインレイアウト
- カレンダー機能
- その他機能

## 🛠️ 修正方法

### **1. themeのインポート追加**

```typescript
// Before
import { Button } from '@/components/shadcn-ui/button'

// After
import { Button } from '@/components/shadcn-ui/button'
import { colors, typography, spacing } from '@/config/theme'
```

### **2. 直接Tailwindクラスの置き換え**

```typescript
// Before
<div className="bg-gray-50 dark:bg-gray-900">

// After
<div className={colors.background.base}>
```

### **3. 一般的な置き換えパターン**

| 直接Tailwind                       | テーマ使用                         |
| ---------------------------------- | ---------------------------------- |
| `bg-gray-50 dark:bg-gray-900`      | `colors.background.base`           |
| `text-gray-900 dark:text-white`    | `colors.text.primary`              |
| `text-gray-600 dark:text-gray-400` | `colors.text.secondary`            |
| `bg-red-100 dark:bg-red-900/20`    | `colors.semantic.error.background` |
| `text-red-600 dark:text-red-400`   | `colors.semantic.error.DEFAULT`    |
| `text-3xl font-bold`               | `typography.heading.h1`            |
| `text-sm`                          | `typography.body.sm`               |

## 📊 進捗追跡

### **修正済みファイル（厳格適用）**

- ✅ `src/app/error/page.tsx` (67→0警告)

### **優先修正ファイル**

- 🔄 `src/app/layout.tsx`
- 🔄 `src/components/shadcn-ui/button.tsx`
- 🔄 `src/features/auth/components/AuthForm.tsx`

### **警告のみファイル（70+件）**

- `src/features/calendar/**/*.tsx`
- `src/features/tags/**/*.tsx`
- `src/components/**/*.tsx`

## 🚀 開発者向けガイド

### **新規ファイル作成時**

1. 必ず`@/config/theme`をインポート
2. 直接Tailwindクラス使用禁止
3. ESLintエラーを0にしてから提出

### **既存ファイル修正時**

1. 可能な範囲でテーマシステムに移行
2. 大規模変更の場合は事前相談
3. テスト実行を忘れずに

### **よく使うテーマ値**

```typescript
// 背景色
colors.background.base // メイン背景
colors.background.surface // カード背景
colors.background.elevated // モーダル背景

// テキスト色
colors.text.primary // メインテキスト
colors.text.secondary // サブテキスト
colors.text.tertiary // 補助テキスト

// セマンティック色
colors.semantic.error.DEFAULT // エラー
colors.semantic.success.DEFAULT // 成功
colors.semantic.warning.DEFAULT // 警告

// ブランド色
colors.primary.DEFAULT // プライマリー
colors.secondary.DEFAULT // セカンダリー
```

## 🔧 トラブルシューティング

### **Q: ESLintでテーマ警告が出ない**

A: プラグインセットアップを実行: `npm run setup:eslint-plugins`

### **Q: テーマ値が見つからない**

A: `src/config/theme/`の該当ファイルを確認

### **Q: ダークモードが効かない**

A: `dark:`プレフィックスを削除し、テーマ値を使用

## 📈 成功指標

- [ ] 新規ファイル：テーマ使用率100%
- [ ] 既存ファイル：段階的に警告数減少
- [ ] ビルドエラー：テーマ関連0件
- [ ] デザイン統一：視覚的一貫性向上

---

**更新日**: 2024-01-01  
**責任者**: BoxLog開発チーム  
**次回レビュー**: 1週間後

---

**最終更新**: 2025-09-18
