# ESLint Tests

BoxLog ESLint品質管理システムのテストファイル群

## 📁 ファイル構成

### `theme-test.tsx`
- **目的**: boxlog-theme/enforce-theme-usage ルールのテスト
- **内容**: theme system使用の正しい例と違反例
- **テスト項目**:
  - ✅ 正しい使用: `colors.primary.DEFAULT`
  - ❌ 違反例: `"bg-red-500 text-white"`

### `compliance-test.tsx`
- **目的**: boxlog-compliance ルールのテスト
- **内容**: コンプライアンス違反の検出テスト
- **テスト項目**:
  - GDPR違反: 個人データのログ出力
  - SOC2違反: ハードコードされたシークレット
  - セキュリティ違反: HTTP通信での個人データ送信

### `performance-test.tsx`
- **目的**: パフォーマンス関連ルールのテスト
- **内容**: パフォーマンスアンチパターンの検出

## 🚀 使用方法

```bash
# 特定テストファイルでESLint実行
npm run lint .eslint/tests/theme-test.tsx

# 全テストファイルでESLint実行  
npm run lint .eslint/tests/

# テスト用レポート生成
npm run lint:report .eslint/tests/
```

## 🎯 用途

1. **ESLint設定検証** - カスタムルールの動作確認
2. **CI/CD品質チェック** - 自動テストでの品質管理システム検証
3. **開発者教育** - 違反例と正しい書き方の学習材料

これらのファイルはプロダクションビルドには含まれません。