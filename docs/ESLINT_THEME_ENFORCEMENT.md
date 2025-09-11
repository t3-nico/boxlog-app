# 🎯 ESLint Theme Enforcement システム

BoxLogプロジェクトでは、**config/themeの使用を強制する高度なESLintシステム**を実装しています。

## 📋 システム概要

### 🎯 目的
1. **直接的な色指定を完全防止**（`bg-red-500`など）
2. **config/themeインポートの強制**
3. **新規ファイルでのtheme使用を必須化**
4. **既存ファイルの段階的移行サポート**

### 🛠️ 実装内容

#### 1. カスタムESLintルール
- `boxlog-theme/enforce-theme-usage` - 包括的なtheme強制
- `boxlog-theme/no-direct-tailwind` - 直接Tailwindクラス検出

#### 2. ファイル種別による動的ルール
```typescript
新規ファイル（3日以内） → ERROR レベル（厳格）
既存ファイル → WARN レベル（段階的移行）
```

#### 3. 除外対象の自動判定
```typescript
除外ファイル = [
  'tailwind.config.ts',
  'globals.css', 
  'storybook',
  '.test.', '.spec.', '__tests__',
  'src/config/theme',
  'src/components/shadcn-ui'
]
```

## 🚀 使用方法

### NPMスクリプト

```bash
# 標準チェック（新規=ERROR, 既存=WARN）
npm run lint:theme:eslint

# 厳格チェック（全てERROR）
npm run lint:theme:strict  

# 移行モード（全てWARN）
npm run lint:theme:migrate

# 通常のlint
npm run lint
```

### VS Code統合

`.vscode/settings.json` により：
- **リアルタイム検出**（入力中にエラー表示）
- **自動修正**（保存時にfixAll実行）
- **カスタムスニペット**（theme import補完）

## 🔍 検出パターン

### ✅ 正しい実装

```tsx
// ✅ OK: theme import
import { colors } from '@/config/theme';

export function Button() {
  return (
    <button className={colors.primary.DEFAULT}>
      ボタン
    </button>
  );
}

// ✅ OK: 許可されたクラス
<div className="flex items-center w-full h-screen p-4">
  レイアウト
</div>
```

### ❌ 検出される違反

```tsx
// ❌ NG: 直接色指定
<button className="bg-red-500">

// ❌ NG: テンプレートリテラル内
<div className={`text-blue-600 font-bold`}>

// ❌ NG: ダークモード個別指定
<div className="bg-white dark:bg-gray-900">

// ❌ NG: ホバー個別指定
<button className="hover:bg-orange-500">

// ❌ NG: themeインポートなし
// Missing import: colors, typography, spacing
```

### 📊 許可パターン

```typescript
allowedPatterns = [
  '^(absolute|relative|fixed|sticky)$',      // 位置
  '^(flex|grid|block|inline|hidden)$',       // レイアウト
  '^(w-|h-|p-|m-|gap-|space-)',            // サイズ・余白
  '^(rounded|border)$',                      // 形状
  '^(text-(xs|sm|base|lg|xl|2xl|3xl))$',    // テキストサイズ
  '^(font-(normal|medium|semibold|bold))$',  // フォント重み
  '^(overflow-|z-|opacity-|cursor-)',       // その他
  '^(transition|duration|ease)',            // アニメーション
  '^(transform|rotate|scale)'               // 変形
]
```

## 🎯 エラーメッセージとアクション

### 直接色指定エラー
```
[ERROR] Direct color class "bg-red-500" detected. 
Use colors.semantic.error.DEFAULT instead.
```

**修正方法:**
```tsx
// Before
<button className="bg-red-500">

// After  
<button className={colors.semantic.error.DEFAULT}>
```

### themeインポート不足エラー
```
[ERROR] Missing theme import. 
Add: import { colors, typography } from '@/config/theme'
```

**修正方法:**
```tsx
// ファイル先頭に追加
import { colors, typography, spacing } from '@/config/theme';
```

### ダークモード個別指定エラー
```
[WARN] Individual dark mode class "dark:bg-gray-900". 
Use theme for automatic dark mode.
```

**修正方法:**
```tsx
// Before
<div className="bg-white dark:bg-gray-900">

// After
<div className={colors.background.surface}>  // 自動ダークモード対応
```

## 🔧 設定カスタマイズ

### `.eslintrc.json` 設定

```json
{
  "rules": {
    "boxlog-theme/enforce-theme-usage": ["error", {
      "excludeFiles": ["custom-exclude-pattern"],
      "allowedPatterns": ["^custom-pattern$"],
      "newFileErrorLevel": "error",
      "existingFileErrorLevel": "warn"
    }]
  }
}
```

### ファイル別ルール調整

```json
{
  "overrides": [
    {
      "files": ["src/legacy/**/*.tsx"],
      "rules": {
        "boxlog-theme/enforce-theme-usage": ["warn", {
          "existingFileErrorLevel": "warn"
        }]
      }
    }
  ]
}
```

## 📈 新規ファイル vs 既存ファイルの判定

### 判定ロジック
```typescript
function isNewFile(filepath: string): boolean {
  const stats = fs.statSync(filepath);
  const fileAge = Date.now() - stats.birthtime.getTime();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  
  return fileAge < threeDaysInMs;  // 3日以内 = 新規
}
```

### 動的ルール適用
```typescript
新規ファイル → "boxlog-theme/enforce-theme-usage": "error"
既存ファイル → "boxlog-theme/enforce-theme-usage": "warn"
```

## 🎨 VS Code統合機能

### リアルタイム検出
```typescript
// 入力中にリアルタイムで表示
className="bg-red-500"  // 🔴 ESLint Error
         ^^^^^^^^^^
         Use colors.semantic.error.DEFAULT
```

### 自動補完強化
```typescript
// type: "col" → suggest: colors.xxx
import { colors } from '@/config/theme';  // 自動import

// IntelliSense強化
colors.|  // → primary, secondary, semantic, etc.
```

### 保存時自動修正
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"  // 保存時修正
  }
}
```

## 🧪 テストケース実行

### テストファイルでの検証
```bash
# test-samples/theme-test.tsx で検証
npm run lint:theme:eslint test-samples/theme-test.tsx

# 期待される結果:
# ✅ theme使用 → エラーなし
# ❌ 直接色指定 → 7 problems (7 errors, 0 warnings)
```

### CI/CD統合
```yaml
# GitHub Actions
- name: Theme Enforcement Check
  run: npm run lint:theme:eslint
  # 違反があるとビルド失敗
```

## 🔄 段階的移行戦略

### Phase 1: 警告モード（現在）
```bash
npm run lint:theme:migrate  # 全て警告レベル
```

### Phase 2: 新規ファイル厳格化
```bash 
npm run lint:theme:eslint  # 新規=ERROR, 既存=WARN
```

### Phase 3: 完全移行
```bash
npm run lint:theme:strict  # 全てERRORレベル
```

## 📊 統計とメトリクス

### 移行進捗の確認
```bash
# 違反数カウント
npm run lint:theme:eslint --format=json | jq '.length'

# ファイル別違反数
npm run lint:theme:eslint --format=stylish
```

### 成功指標
- ✅ 新規ファイル: 0 violations
- 🔄 既存ファイル: 段階的削減
- 📈 theme使用率: 100%達成

## 🤝 開発者ガイド

### 新機能開発時
1. **theme importから開始**
   ```tsx
   import { colors, typography, spacing } from '@/config/theme';
   ```

2. **VSCodeでリアルタイム確認**
   - 赤線 = 修正必要
   - 緑線 = OK

3. **保存前にlint実行**
   ```bash
   npm run lint:theme:eslint src/components/NewComponent.tsx
   ```

### 既存ファイル修正時
1. **段階的アプローチ**
   - 一度に全修正せず、触った部分のみ
   - theme importを追加
   - 直接色指定を順次置換

2. **優先順位**
   - 🔴 ERROR → 最優先
   - 🟡 WARN → 計画的修正

## 🔗 関連ドキュメント

- [CLAUDE.md](../CLAUDE.md) - 基本開発指針
- [THEME_ENFORCEMENT.md](./THEME_ENFORCEMENT.md) - 包括的なtheme強制システム
- [src/config/theme/](../src/config/theme/) - Theme定義リファレンス

---

**🎯 最終目標: 100% config/theme経由でのスタイリング実現**