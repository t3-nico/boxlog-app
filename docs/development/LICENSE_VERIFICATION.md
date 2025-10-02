# ライセンス検証システム

BoxLogアプリのライセンス検証システムドキュメント

## 🎯 概要

Phase 2a: ライセンス検証システムは、依存関係のライセンスを自動監査し、企業レベルのコンプライアンスを確保するシステムです。

## 🔍 機能

### 自動ライセンス監査
- 全production依存関係の自動スキャン
- ライセンス分類（許可/警告/禁止/不明）
- キャッシュ機能による高速化
- Pre-commitフック統合

### ライセンス分類

#### ✅ 許可ライセンス
- MIT
- Apache-2.0
- ISC
- BSD-2-Clause, BSD-3-Clause
- CC0-1.0, BlueOak-1.0.0, 0BSD
- Python-2.0, CC-BY-4.0, CC-BY-3.0
- UNLICENSED (内部パッケージ)

#### ⚠️ 警告ライセンス（レビュー推奨）
- MPL-2.0 (Mozilla Public License)
- (MPL-2.0 OR Apache-2.0)
- (AFL-2.1 OR BSD-3-Clause)
- (WTFPL OR MIT)
- (MIT AND CC-BY-3.0)
- (MIT OR CC0-1.0)

#### ❌ 禁止ライセンス（コミットブロック）
- GPL-2.0, GPL-3.0
- LGPL-2.1, LGPL-3.0
- AGPL-3.0
- EUPL-1.1, EUPL-1.2
- CDDL-1.0, EPL-1.0, EPL-2.0

## 🚀 使用方法

### NPMスクリプト

```bash
# 基本チェック（依存関係変更時のみ）
npm run license:check

# 強制実行（全依存関係をスキャン）
npm run license:check:force

# 簡易監査レポート
npm run license:audit

# CSV形式レポート生成
npm run license:report
```

### コマンドライン

```bash
# 基本実行
node scripts/license-checker.js

# 強制実行
node scripts/license-checker.js --force
```

## ⚙️ 設定

### ライセンス設定
`scripts/license-checker.js`の`CONFIG`オブジェクトで設定：

```javascript
const CONFIG = {
  allowedLicenses: [...],    // 許可ライセンス
  warningLicenses: [...],    // 警告ライセンス
  prohibitedLicenses: [...], // 禁止ライセンス
  cacheFile: '.license-cache.json' // キャッシュファイル
}
```

### キャッシュ機能
- package.json変更検出による自動キャッシュ更新
- 高速な再実行（キャッシュヒット時）
- `.license-cache.json`でキャッシュ管理

## 🔧 統合

### Pre-commitフック
`.husky/pre-commit`で自動実行：

```bash
# ライセンス検証（Phase 2a: BigTech標準）
node scripts/license-checker.js
```

### CI/CD統合
依存関係変更時の自動チェック：
- package.json, package-lock.json, yarn.lock変更検出
- 自動スキップ（変更なしの場合）
- エラー時のコミット阻止

## 📊 出力例

### 成功時
```
📜 Checking license compliance...
🔍 Scanning dependency licenses...
📊 License Summary:
   ✅ Allowed: 429 packages
   ⚠️  Warnings: 3 packages
✅ License compliance check passed
```

### 警告時
```
⚠️  License warnings (review recommended):
   📜 MPL-2.0:
      • @vercel/analytics@1.5.0
   📜 (MPL-2.0 OR Apache-2.0):
      • dompurify@3.2.7
```

### 禁止ライセンス検出時
```
❌ Prohibited licenses detected:
   📜 GPL-3.0:
      • example-package@1.0.0

💡 Solutions:
   • Find alternative packages with compatible licenses
   • Contact package maintainers about license compatibility
```

## 🛡️ セキュリティ

### コンプライアンス保証
- 企業レベルのライセンス管理
- 法的リスクの事前回避
- オープンソース利用ポリシー準拠

### 監査機能
- 全依存関係の透明性
- ライセンス変更の検出
- コンプライアンス履歴管理

## 🔍 トラブルシューティング

### よくある問題

#### 1. 不明ライセンスの対応
```bash
❌ Unknown licenses detected:
   📜 CUSTOM-LICENSE:
      • some-package@1.0.0
```
**解決方法:**
1. パッケージドキュメントでライセンス確認
2. 互換性があれば`allowedLicenses`に追加
3. 代替パッケージの検討

#### 2. キャッシュ問題
```bash
⚠️  Could not load license cache: [error]
```
**解決方法:**
```bash
rm .license-cache.json
npm run license:check:force
```

#### 3. パフォーマンス問題
大規模プロジェクトでのスキャン時間最適化：
- キャッシュ活用（通常時）
- 依存関係変更時のみ実行
- production依存関係のみスキャン

## 📈 メトリクス

### パフォーマンス
- 初回スキャン: ~10-30秒（プロジェクト規模による）
- キャッシュヒット: ~1-2秒
- 依存関係変更なし: ~0.5秒

### カバレッジ（現在のBoxLogプロジェクト）
- スキャン対象: 429パッケージ
- 許可ライセンス: 426パッケージ (99.3%)
- 警告ライセンス: 3パッケージ (0.7%)
- 禁止/不明: 0パッケージ (0%)

## 🚀 今後の拡張

### Phase 2a+計画
- [ ] ライセンス変更履歴追跡
- [ ] Slackアラート統合
- [ ] ダッシュボードUI
- [ ] 詳細レポート生成
- [ ] 自動パッケージ更新提案

---

**📚 関連ドキュメント:**
- [Bundle Size Monitoring](../BUNDLE_MONITORING.md)
- [ESLint Setup](../ESLINT_SETUP_COMPLETE.md)

**🔗 関連Issue:** #240 - Phase 2a: ライセンス検証システム実装