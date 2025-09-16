# 🤖 GitHub Actions ワークフロー概要

BoxLog Appの自動化されたCI/CDとコード品質管理システムです。

## 📋 現在のワークフロー一覧

### 🚀 基本CI/CD

| ワークフロー | ファイル | トリガー           | 役割                           |
| ------------ | -------- | ------------------ | ------------------------------ |
| **CI**       | `ci.yml` | Push/PR (dev,main) | 基本的なlint/test/build/deploy |

### 🔍 コード品質管理システム

| ワークフロー          | ファイル                | トリガー           | 役割                     |
| --------------------- | ----------------------- | ------------------ | ------------------------ |
| **Code Quality**      | `code-quality.yml`      | Push/PR (dev,main) | 包括的コード品質チェック |
| **Compliance Audit**  | `compliance-audit.yml`  | 手動実行           | GDPR・セキュリティ監査   |
| **Bundle Monitoring** | `bundle-monitoring.yml` | Push/PR            | バンドルサイズ監視       |

## 🎯 各ワークフローの詳細

### 1. **CI (ci.yml)**

```yaml
トリガー: Push/PR → dev, main
実行内容: ✅ lint (npm run lint)
  ✅ typecheck (npm run typecheck)
  ✅ test (npm run test)
  ✅ build (npm run build)
  🚀 deploy (mainブランチのみ Vercel)
```

### 2. **Code Quality (code-quality.yml)**

```yaml
トリガー: Push/PR → dev, main
実行内容: 🔍 ESLint包括分析
  🎨 Theme使用状況チェック
  ⚡ Performance監視
  📊 複雑度分析
  💬 PR品質レポート投稿
```

### 3. **Compliance Audit (compliance-audit.yml)**

```yaml
トリガー: 手動実行 (workflow_dispatch)
実行内容: 🔒 GDPR準拠性チェック
  🛡️ セキュリティ監査
  📋 コンプライアンス レポート
  📄 監査証跡生成
```

### 4. **Bundle Monitoring (bundle-monitoring.yml)**

```yaml
トリガー: Push/PR
実行内容: 📦 バンドルサイズ分析
  📈 サイズ変化レポート
  ⚠️ サイズ増加アラート
  🔍 重複依存関係チェック
```

## 🔄 ワークフロー実行状況

### ✅ 正常動作中

- **CI**: 基本的なlint/test/buildが実行
- **Code Quality**: PR時のコード品質チェック
- **Bundle Monitoring**: バンドルサイズ監視

### ⚠️ 注意が必要

- **Compliance Audit**: 手動実行のため定期チェック推奨

## 🛠️ 設定・管理

### Secrets設定 (GitHub Settings → Secrets)

```
VERCEL_TOKEN     # Vercel デプロイ用
ORG_ID          # Vercel 組織ID
PROJECT_ID      # Vercel プロジェクトID
GITHUB_TOKEN    # Issue作成・PR操作用 (自動設定)
```

### 実行権限

- **自動実行**: CI, Code Quality, Bundle Monitoring
- **手動実行**: Compliance Audit

## 📊 監視・アラート機能

### 🚨 自動アラート

1. **バンドルサイズ増加** → PR コメント
2. **コンプライアンス違反** → 管理者通知

### 📈 レポート機能

1. **PR品質レポート** → 自動コメント
2. **セキュリティ監査** → 証跡保存

## 🔧 トラブルシューティング

### よくある問題

1. **ESLintエラーでCI失敗** → `npm run lint:fix` で修正
2. **Bundle size超過** → 依存関係見直し
3. **TypeCheckエラー** → 継続実行設定済み
4. **1Password認証エラー** → fallbackコマンド使用

### ログ確認方法

```bash
# GitHub Actions画面で確認
https://github.com/t3-nico/boxlog-app/actions

# ローカルでのテスト実行
npm run lint           # コード品質チェック
npm run test           # テスト実行
npm run build          # ビルド確認
```

---

## 📝 更新履歴

- **2025-09-17**: reportsディレクトリ削除、Tech Debt Monitoring削除、TODO Management削除、レポート系簡素化
- **2025-09-11**: 包括的ESLint品質管理システム実装
- **2025-09-11**: Issue管理システム統合
- **Initial**: 基本CI/CDパイプライン構築

---

**🎯 目標**: 100%自動化された品質管理により、手動チェック作業を最小化し、一貫した高品質なコード維持を実現する。
