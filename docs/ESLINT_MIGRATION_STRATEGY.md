# 📈 ESLint段階的厳格化戦略

## 概要

BoxLogでは、ファイルの新旧に応じて段階的にESLintルールを厳格化しています。

## 🎯 ルールレベル戦略

### ファイル分類と適用ルール

| ファイル種別       | 作成からの日数 | ルールレベル | 理由                 |
| ------------------ | -------------- | ------------ | -------------------- |
| **新規ファイル**   | 未追跡         | `error`      | 最初から高品質を維持 |
| **最近のファイル** | 0-7日          | `error`      | 新しいコードは厳格に |
| **標準ファイル**   | 8-30日         | `warn`       | 段階的に改善         |
| **既存ファイル**   | 31日以上       | `warn→error` | 徐々に移行           |

## 📊 現在のステータス確認

```bash
# ファイルステータスレポート生成
npm run lint:status

# 特定ディレクトリのチェック
node scripts/file-status-checker.js src/components

# プロジェクト全体の分布確認
npm run lint:distribution

# 統合機能テスト
npm run lint:integration-test
```

## 🚀 並列実行による高速化

### Worker Threads並列実行システム

BoxLogでは、ESLintの実行を高速化するためにWorker Threads並列実行を導入しています。

#### パフォーマンス比較

| 実行方式         | 時間   | ワーカー数 | コマンド                  |
| ---------------- | ------ | ---------- | ------------------------- |
| **並列（最速）** | ~1.5秒 | 10         | `npm run lint`            |
| **並列（中速）** | ~3.6秒 | 2          | `npm run lint:parallel:2` |
| **直列（従来）** | 未測定 | 1          | `npm run lint:serial`     |

#### 使用方法

```bash
# デフォルト並列実行（推奨）
npm run lint

# CPU数を指定して実行
npm run lint:parallel:2   # 2ワーカー
npm run lint:parallel:4   # 4ワーカー
npm run lint:parallel:fast # 8ワーカー（高速）

# ベンチマーク比較
npm run lint:benchmark
```

## 📋 移行プロセス

### Phase 1: 新規ファイルの厳格化（完了）

- ✅ Git未追跡ファイルは自動的に`error`レベル
- ✅ 7日以内の新しいファイルも`error`レベル
- ✅ 新規開発は最初から高品質を維持

### Phase 2: 既存ファイルの段階的改善（進行中）

- 🔄 8-30日のファイルは`warn`レベルで警告表示
- 🔄 開発者は警告を確認し、順次修正
- 🔄 30日経過後、自動的に`error`レベルへ移行

### Phase 3: レガシーコードのリファクタリング（計画中）

- 📅 30日以上経過したファイル（現在464ファイル）
- 📅 段階的にリファクタリングを実施
- 📅 最終的にすべて`error`レベルで統一

## 🔧 環境別設定

### 開発環境（development）

```javascript
NODE_ENV=development npm run lint
```

- Progressive rulesは`warn`レベル
- 開発速度を重視しつつ品質意識を醸成

### 本番環境（production）

```javascript
NODE_ENV=production npm run lint
```

- Progressive rulesも`error`レベル
- 本番デプロイ前の厳格なチェック

## 📊 現在のプロジェクトステータス

2025年9月時点のファイル分布:

| カテゴリ | ファイル数 | 割合     | アクション             |
| -------- | ---------- | -------- | ---------------------- |
| 🆕 新規  | 51         | 6.8%     | 自動的に厳格ルール適用 |
| 📅 最近  | 135        | 18.1%    | 厳格ルール適用中       |
| 📝 標準  | 96         | 12.9%    | 段階的移行中           |
| 🏛️ 既存  | 464        | 62.2%    | リファクタリング計画   |
| **合計** | **746**    | **100%** | -                      |

## 🎯 移行目標

### 短期目標（1ヶ月）

- [ ] 新規ファイルの100%厳格化維持
- [ ] 標準ファイル（96個）の50%を修正
- [ ] 並列実行による開発体験改善

### 中期目標（3ヶ月）

- [ ] 標準ファイルの100%修正完了
- [ ] 既存ファイル（464個）の30%修正
- [ ] カスタムESLintルール導入

### 長期目標（6ヶ月）

- [ ] 全ファイルで`error`レベル達成
- [ ] 技術的負債の完全解消
- [ ] 自動化された品質維持体制

## 💡 開発者向けTips

### 新規ファイル作成時

```bash
# ファイル作成後すぐにlintチェック
touch src/components/NewComponent.tsx
npm run lint src/components/NewComponent.tsx
```

### 既存ファイル修正時

```bash
# 修正前にステータス確認
npm run lint:status

# 修正と自動修正
npm run lint:fix

# 並列実行で高速チェック
npm run lint:parallel:fast
```

### CI/CDでの活用

```yaml
# GitHub Actions
- name: ⚡ Run Parallel ESLint
  run: npm run lint:parallel
```

## 📚 関連ドキュメント

- [ESLintセットアップ完全ガイド](./ESLINT_SETUP_COMPLETE.md)
- [コード品質管理](./CODE_QUALITY.md)
- [開発ワークフロー](./DEVELOPMENT_WORKFLOW.md)

## 🔄 更新履歴

- **2025-09-29**: Worker Threads並列実行システム導入
- **2025-09-29**: ファイル新旧判定ヘルパー実装
- **2025-09-29**: 統合設定システム構築
- **2025-09-29**: 移行戦略ドキュメント作成

---

**最終更新**: 2025-09-29
**バージョン**: v1.0.0
