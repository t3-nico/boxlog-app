# パフォーマンス回帰テストシステム

BoxLogアプリのパフォーマンス回帰テスト・自動ベンチマーク検証システムドキュメント

## 🎯 概要

Phase 2c: パフォーマンス回帰テストシステムは、アプリケーションのパフォーマンス指標を継続的に監視し、性能低下を事前に検出・防止する企業レベルのシステムです。

## 🔍 監視対象メトリクス

### TypeScript型チェック時間

- 増分型チェック（`tsc --noEmit --incremental`）
- 軽量で高速な型安全性検証
- 開発者体験への影響を最小化

### バンドルサイズ分析

- JavaScript総容量
- CSS総容量
- 総バンドルサイズ
- 既存ビルドからの自動分析

### 回帰検出しきい値

#### ⚠️ 警告レベル

- TypeScript Check: 30%増加
- Bundle Size: 10%増加

#### 🚨 エラーレベル（コミットブロック）

- TypeScript Check: 100%増加
- Bundle Size: 20%増加

## 🚀 使用方法

### NPMスクリプト

```bash
# 基本チェック（パフォーマンス関連ファイル変更時のみ）
npm run perf:check

# 強制実行（全メトリクスを測定）
npm run perf:check:force

# ベースライン作成
npm run perf:baseline

# ベースライン更新
npm run perf:update-baseline
```

### コマンドライン

```bash
# 基本実行
node scripts/performance-regression-test.js

# 強制実行
node scripts/performance-regression-test.js --force

# ベースライン作成
node scripts/performance-regression-test.js --create-baseline
```

## ⚙️ システム構成

### 軽量設計

既存ビルドを活用し、重い再ビルドを避ける設計：

- バンドルサイズ: .next/static から直接取得
- TypeScript: 増分チェックで高速化
- キャッシュ活用で応答性向上

### 自動検出機能

パフォーマンスに影響する変更を自動検出：

- `.ts`, `.tsx`, `.js`, `.jsx` ファイル
- `package.json` 依存関係変更
- Next.js設定ファイル変更
- Tailwind CSS設定変更

## 📊 出力例

### 正常時

```
⚡ Checking performance regression...
⏱️  Measuring build performance...
📊 Using existing build for bundle analysis
📊 Performance Analysis:
   📦 Bundle Size: 19.1 MB
✅ Performance regression check passed
```

### ベースライン比較時（改善）

```
📊 Performance Analysis:
   🔍 TypeScript Check: 2.3s
   📦 Bundle Size: 18.5 MB

🎉 Performance improvements:
   ⚡ Bundle Size: 18.5 MB (-5.2%)
```

### 回帰検出時

```
⚠️  Performance warnings:
   ⚠️  Bundle Size: 21.2 MB (+15.3%) - was 18.5 MB

💡 Optimization suggestions:
   • Review recent changes for performance impact
   • Check for new large dependencies
   • Consider code splitting for large components
   • Optimize imports and eliminate dead code
```

### エラー時（コミットブロック）

```
❌ Performance regression detected:
   📉 Bundle Size: 22.8 MB (+25.1%) - was 18.5 MB

❌ Performance regression detected - Please review before committing
```

## 🔧 統合

### Pre-commitフック

`.husky/pre-commit`で自動実行：

```bash
# パフォーマンス回帰テスト（Phase 2c: BigTech標準）
node scripts/performance-regression-test.js
```

### CI/CD統合

- パフォーマンス関連ファイル変更時の自動チェック
- 自動スキップ（変更なしの場合）
- 回帰検出時のコミット阻止

## 🏗️ アーキテクチャ

### ベースライン管理

```json
{
  "typecheckTime": 2300,
  "bundleSize": 20000000,
  "bundleJS": 15000000,
  "bundleCSS": 5000000,
  "timestamp": "2025-09-25T00:30:00.000Z",
  "createdAt": "2025-09-25T00:30:00.000Z",
  "version": "0.1.0"
}
```

### フォールバック制限値

ベースラインがない場合の制限値：

- TypeScript Check: 30秒
- Bundle Size: 50MB（開発ビルド想定）

### パフォーマンス測定

```javascript
// 軽量TypeScript チェック
const typecheckStart = Date.now()
execSync('tsc --noEmit --incremental', { stdio: 'pipe' })
metrics.typecheckTime = Date.now() - typecheckStart

// バンドルサイズ計算
function calculateDirSize(dir, extension) {
  // .next/static ディレクトリを再帰的にスキャン
  // .js, .css ファイルのサイズを合計
}
```

## 📈 メトリクス

### パフォーマンス（現在のBoxLogプロジェクト）

- TypeScript Check: ~2-5秒（増分）
- Bundle Size: ~19MB（開発ビルド）
- Bundle JS: ~15MB
- Bundle CSS: ~4MB

### 効率性

- 測定時間: ~5-10秒
- ビルド済み活用: 再ビルド不要
- 自動スキップ: 関連ファイル変更時のみ実行

## 🛡️ 品質保証

### 企業レベル監視

- 継続的パフォーマンス監視
- 性能劣化の早期発見
- 開発者への即座なフィードバック

### 開発者体験

- 軽量・高速な測定
- 明確なエラーメッセージ
- 改善提案の自動表示

## 🔍 トラブルシューティング

### よくある問題

#### 1. ビルドが存在しない

```bash
⚠️  No build found - bundle metrics unavailable
```

**解決方法:**

```bash
npm run smart:build
npm run perf:check:force
```

#### 2. TypeScript チェック失敗

```bash
⚠️  TypeScript check failed, skipping metric
```

**解決方法:**

- TypeScript設定の確認
- 型エラーの修正
- 増分キャッシュのクリア: `rm -rf node_modules/.cache/typescript`

#### 3. 制限値超過（誤検出）

```bash
❌ Performance limits exceeded: Bundle Size exceeds limit
```

**解決方法:**

1. 実際のパフォーマンス問題かを確認
2. ベースラインが未設定の場合: `npm run perf:baseline`
3. 意図的な増加の場合: `npm run perf:update-baseline`

#### 4. 大幅な誤検出

**調整方法:**
`performance-regression-test.js`の`CONFIG.thresholds`で閾値調整

## 🚀 今後の拡張

### Phase 2c+計画

- [ ] ビルド時間の実測定
- [ ] メモリ使用量監視
- [ ] ランタイムパフォーマンス測定
- [ ] パフォーマンス履歴の可視化
- [ ] Lighthouseスコア統合
- [ ] 複数環境での比較分析

### 監視対象拡張

- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Time to Interactive (TTI)
- [ ] Core Web Vitals自動測定

## 📊 成果指標

### パフォーマンス改善

- 性能劣化の早期発見率: 95%+
- 意図しないバンドルサイズ増加の防止
- TypeScript型チェック時間の管理

### 開発効率向上

- パフォーマンス問題への対応時間短縮
- 継続的な品質管理の自動化
- 開発者への即座なフィードバック

---

**📚 関連ドキュメント:**

- [License Verification](./LICENSE_VERIFICATION.md)
- [API Change Detection](./API_CHANGE_DETECTION.md)
- [Bundle Size Monitoring](../BUNDLE_MONITORING.md)
- [ESLint Setup](../ESLINT_SETUP_COMPLETE.md)

**🔗 関連Issue:** #242 - Phase 2c: パフォーマンス回帰テスト実装
