# 🚀 ESLint Quick Reference - 緊急時対応ガイド

> **すぐに解決したい時のためのクイックリファレンス**

## ⚡ 緊急対応

### 🚨 ESLintが動かない時

```bash
# まずはこれを実行
npm run eslint:setup

# だめなら完全リセット
rm -rf node_modules/.cache
rm -rf .eslint/cache
npm run eslint:setup
npm run lint:cache
```

### 🔧 よく使うコマンド（コピペ用）

```bash
# 日常的な開発
npm run lint:cache          # キャッシュ付き高速チェック
npm run lint:fix           # 自動修正付きチェック
npm run lint:dev           # 開発環境（緩い設定）

# コミット前チェック
npm run lint:prod          # 本番環境（厳格な設定）
npm run lint:report        # HTMLレポート生成

# 特定の問題のみ
npm run lint:theme         # テーマ違反のみ
npm run lint:imports       # Import順序のみ
npm run lint:compliance    # コンプライアンスのみ

# トラブル時
npm run eslint:setup       # セットアップ再実行
npm run lint -- --no-cache # キャッシュなし実行
```

## 🔥 頻出エラーと瞬殺修正

### ❌ Import順序エラー

**エラー**: `There should be at least one empty line between import groups`

**修正テンプレート**:
```typescript
// ✅ この順序で書く
import React from 'react'
import { NextPage } from 'next'

import { format } from 'date-fns'
import { clsx } from 'clsx'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

import { validateInput } from '../utils/validation'
import { FormData } from './types'
```

### ❌ テーマ違反エラー

**エラー**: `Direct color class "bg-blue-500" detected`

**修正テンプレート**:
```typescript
// ❌ ダメ
<div className="bg-blue-500 text-white p-4">

// ✅ 正解
import { colors, spacing } from '@/config/theme'
<div className={`${colors.primary.DEFAULT} ${colors.text.white} ${spacing.padding.md}`}>
```

### ❌ 未使用インポートエラー

**修正方法**:
```bash
# 自動修正が最速
npm run lint:fix
```

### ❌ TODO構造化エラー

**エラー**: `TODO/FIXMEは構造化してください`

**修正テンプレート**:
```typescript
// ❌ ダメ
// TODO: これを後で直す

// ✅ 正解（最小構成）
// TODO: ユーザー認証機能の実装

// ✅ 完全版（推奨）
// TODO [TASK-123] (2024-12-31) @takayasu: ユーザー認証機能の実装
```

## 🛠️ トラブルシューティング 30秒診断

### 1️⃣ 「ルールが見つからない」
```bash
ls node_modules/eslint-plugin-boxlog-*
# 何も表示されない → npm run eslint:setup
```

### 2️⃣ 「設定ファイルが無効」
```bash
node .eslint/scripts/setup.js
# エラーが出る → 設定ファイルに構文エラー
```

### 3️⃣ 「実行が遅い」
```bash
rm -rf .eslint/cache/*
npm run lint:cache
# まだ遅い → ファイル数が多すぎる可能性
```

### 4️⃣ 「変更が反映されない」
```bash
npm run lint -- --no-cache
# これで反映される → キャッシュ問題
```

## 📁 ファイル場所の暗記用

```
.eslint/
├── index.js              ← メイン設定（環境判定）
├── configs/
│   ├── base.js           ← 共通設定（Import順序等）
│   ├── development.js    ← 開発用（緩い）
│   └── production.js     ← 本番用（厳格）
├── overrides/
│   ├── generated.js      ← 自動生成ファイル用
│   └── legacy.js         ← レガシーコード用
└── scripts/setup.js      ← セットアップスクリプト
```

## 🎯 設定変更のパターン

### 新しいルール追加
```javascript
// .eslint/configs/base.js の rules に追加
'new-rule-name': 'error'
```

### 環境別ルール調整
```javascript
// .eslint/configs/development.js
'strict-rule': 'warn'  // 開発では緩く

// .eslint/configs/production.js  
'strict-rule': 'error' // 本番では厳格
```

### ファイル除外
```javascript
// .eslint/overrides/legacy.js の files に追加
'src/path/to/exclude/**'
```

## 🔍 デバッグコマンド集

```bash
# 特定ファイルの設定確認
eslint --print-config src/app/page.tsx -c .eslint/index.js

# ルール一覧表示
eslint --print-config src/app/page.tsx -c .eslint/index.js | jq '.rules'

# 詳細デバッグ出力
eslint src/app/page.tsx -c .eslint/index.js --debug

# 特定ルールのみ実行
eslint src/ -c .eslint/index.js --rule 'import/order: error'
```

## 🎛️ 環境変数チートシート

```bash
# 開発環境設定で実行
NODE_ENV=development npm run lint

# 本番環境設定で実行  
NODE_ENV=production npm run lint

# キャッシュを使わない
ESLINT_NO_CACHE=1 npm run lint

# 詳細出力
DEBUG=eslint:* npm run lint
```

## 📋 パフォーマンス最適化チートシート

```bash
# 最高速度（キャッシュ + 並列）
npm run lint:cache

# 部分実行（コンポーネントのみ）
eslint src/components/ -c .eslint/index.js --cache

# 差分のみ（Git）
git diff --name-only HEAD~1 | grep -E '\.(ts|tsx)$' | xargs eslint -c .eslint/index.js

# 大規模プロジェクト用（バッチ）
find src -name "*.tsx" | xargs -n 50 eslint -c .eslint/index.js --cache
```

## 🔧 緊急設定無効化

```bash
# 全ルール無効化（緊急時のみ）
eslint src/ -c .eslint/index.js --rule '{}'

# 特定ルール無効化
eslint src/ -c .eslint/index.js --rule 'import/order: off'

# テーマルール無効化
eslint src/ -c .eslint/index.js --rule 'boxlog-theme/*: off'
```

## 📞 ヘルプ・リソース

### 🆘 困った時の連絡先
1. **チームSlack**: `#dev-frontend` チャンネル
2. **GitHub Issues**: プロジェクトのIssues
3. **ドキュメント**: `.eslint/README_DETAILED.md`

### 📚 参考リンク
- [ESLint公式](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Import Plugin](https://github.com/import-js/eslint-plugin-import)

### 🔗 内部リンク
- **詳細ドキュメント**: `.eslint/README_DETAILED.md`
- **基本的な使い方**: `.eslint/docs/README.md`
- **技術的負債レポート**: `reports/tech-debt.html`

---

## 💡 Pro Tips

1. **VS Code設定**: ESLint拡張機能で自動修正ON推奨
2. **Pre-commit Hook**: `npm run lint:prod`を仕込むと品質向上
3. **CI/CD**: GitHub Actionsでの並列実行で高速化
4. **チーム開発**: 厳格さは段階的に上げる
5. **緊急時**: `lint:fix`で大部分は自動修正可能

**🚨 最重要**: 困った時は `npm run eslint:setup` → `npm run lint:cache`