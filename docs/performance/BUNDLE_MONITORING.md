# 📦 BoxLog Bundle Size Monitoring

BoxLogアプリケーションのバンドルサイズ監視とパフォーマンス最適化のドキュメント

## 🎯 概要

BoxLogでは、アプリケーションのパフォーマンスを維持するために厳格なバンドルサイズ制限を設けています。これにより、ユーザーエクスペリエンスの向上と高速なページ読み込みを実現しています。

## 📏 バンドルサイズ制限

### JavaScript バンドル制限

- **メインJS合計**: 800KB
- **初期読み込みJS**: 500KB
- **個別チャンク**: 250KB

### CSS バンドル制限

- **CSS合計**: 150KB
- **初期読み込みCSS**: 100KB

### 総合制限

- **全バンドル合計**: 1MB
- **警告しきい値**: 80%（制限の80%に到達で警告）

## 🚀 利用可能なコマンド

### バンドルサイズチェック

```bash
# 基本的なバンドルサイズチェック
npm run bundle:check

# 詳細出力でのチェック
npm run bundle:check:verbose

# バンドル分析レポート生成
npm run bundle:analyze

# チェック + 分析の組み合わせ
npm run bundle:monitor
```

### ESLint バンドル最適化

```bash
# バンドル最適化ルールのチェック
npm run lint:bundle

# 厳格モード（エラーレベル）
npm run lint:bundle:strict

# インポート順序チェック
npm run lint:imports
```

## 🔍 バンドル監視の仕組み

### 1. 自動チェック

- **PR作成時**: 自動的にバンドルサイズをチェック
- **Push時**: main/devブランチへのpushで監視実行
- **比較分析**: PRの変更前後でサイズ比較

### 2. CI/CD統合

```yaml
# .github/workflows/bundle-monitoring.yml
- バンドルサイズチェック
- バンドル分析レポート生成
- PR内でのサイズ比較コメント
```

### 3. 監視対象ファイル

- `src/**` - すべてのソースコード
- `package.json` - 依存関係の変更
- `next.config.*` - Next.js設定の変更
- `tailwind.config.*` - CSS設定の変更

## 🛠️ バンドル最適化のベストプラクティス

### 1. 動的インポート（コードスプリッティング）

```tsx
// ❌ 避ける：静的インポート（大きなコンポーネント）
import HeavyComponent from './HeavyComponent'

// ✅ 推奨：動的インポート
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

// Next.js dynamic imports
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
})
```

### 2. ライブラリのTree-shaking

```tsx
// ❌ 避ける：ライブラリ全体のインポート
import * as lodash from 'lodash'
import moment from 'moment'

// ✅ 推奨：必要な関数のみインポート
import { debounce } from 'lodash'
import { format } from 'date-fns'
```

### 3. 重複モジュールの排除

```tsx
// ❌ 避ける：重複インポート
import { format } from 'date-fns'
import { format } from 'date-fns' // 重複

// ✅ 推奨：一度だけインポート
import { format, parseISO } from 'date-fns'
```

### 4. バレルファイルの適切な使用

```tsx
// ❌ 避ける：バレルファイルから大量インポート
import { A, B, C, D, E, F } from '@/components'

// ✅ 推奨：直接インポートまたは少数のインポート
import A from '@/components/A'
import B from '@/components/B'
```

## 📊 監視レポートの読み方

### バンドルサイズチェック結果

```
✅ 総合サイズ: 756.3 KB / 1000.0 KB (75.6%)
✅ JavaScript合計: 623.1 KB / 800.0 KB (77.9%)
⚠️ 初期読み込みJS: 425.7 KB / 500.0 KB (85.1%)
✅ CSS合計: 133.2 KB / 150.0 KB (88.8%)
✅ 初期読み込みCSS: 87.4 KB / 100.0 KB (87.4%)
```

### ステータス表示

- ✅ **正常**: 制限内
- ⚠️ **警告**: 80%を超過
- ❌ **エラー**: 制限を超過

### 大きなチャンクの表示

```
📦 大きなJavaScriptチャンク:
  245.6 KB - pages/_app-1234abcd.js
  187.3 KB - chunks/framework-5678efgh.js
  123.4 KB - chunks/commons-9012ijkl.js
```

## 💡 最適化の提案

バンドルサイズが制限に近づくと、システムが自動的に最適化提案を表示：

- 🔧 動的インポート (React.lazy) でコードスプリッティングを検討
- 🎨 未使用CSSの削除、CSS Purge設定の見直し
- 📦 大きなチャンクのリファクタリング、外部ライブラリの見直し
- 📊 Tree-shaking設定の確認、重複モジュールの排除

## 🔧 カスタム設定

### 制限値の変更

`scripts/bundle-check.js` の `BUNDLE_LIMITS` オブジェクトで調整可能：

```javascript
const BUNDLE_LIMITS = {
  maxTotalJS: 800 * 1024, // 800KB
  maxInitialJS: 500 * 1024, // 500KB
  maxChunkJS: 250 * 1024, // 250KB
  maxTotalCSS: 150 * 1024, // 150KB
  maxInitialCSS: 100 * 1024, // 100KB
  maxTotal: 1000 * 1024, // 1MB
  warningThreshold: 0.8, // 80%で警告
}
```

### 除外ファイルの設定

特定のファイルを監視から除外したい場合：

```javascript
// next.config.mjs
const nextConfig = {
  webpack: (config) => {
    // バンドル分析から除外するファイル
    config.resolve.alias['@/exclude'] = false
    return config
  },
}
```

## 🚨 トラブルシューティング

### バンドルサイズが突然増加した場合

1. **新しい依存関係**: `package.json` の変更を確認
2. **大きなアセット**: 画像やフォントファイルの追加を確認
3. **コードの重複**: ESLintの `import/no-duplicates` エラーを確認

### ビルドエラーが発生する場合

```bash
# キャッシュクリア
rm -rf .next
npm run build:fallback

# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

### CI/CDでエラーが発生する場合

1. **ファイルパス**: `scripts/bundle-check.js` の実行権限を確認
2. **環境変数**: GitHub Actionsの環境変数設定を確認
3. **Node.jsバージョン**: CIとローカルのバージョン一致を確認

## 📈 継続的改善

### 月次レビュー

- バンドルサイズの推移確認
- 新しい最適化手法の導入検討
- 制限値の見直し

### 機能追加時のチェックリスト

- [ ] 新しいライブラリは必要最小限か？
- [ ] Tree-shakingは有効か？
- [ ] 動的インポートは適用可能か？
- [ ] バンドルサイズチェックは通過するか？

---

**📖 関連ドキュメント**

- [Performance Optimization Guide](./BUNDLE_MONITORING.md)
- [ESLint Configuration](./ESLINT_THEME_ENFORCEMENT.md)
- [CI/CD Pipeline](./CI_CD_SETUP.md)

---

**最終更新**: 2025-09-18
