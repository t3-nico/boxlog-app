# 🤖 GitHub Actions ワークフロー

BoxLog Appの自動化されたCI/CDシステム（一人開発最適化版）

## 📋 ワークフロー構成

| ワークフロー | ファイル | トリガー | 役割 |
|------------|---------|---------|------|
| **CI/CD** | [`ci.yml`](ci.yml) | Push/PR (dev,main) | lint + typecheck + test + build |
| **Security** | [`security.yml`](security.yml) | 定期実行 (毎日) | セキュリティスキャン + 依存関係監査 |
| **Bundle Check** | [`bundle-check.yml`](bundle-check.yml) | PR作成時 | バンドルサイズ監視 |

## 🚀 CI/CD ([ci.yml](ci.yml))

```yaml
トリガー: Push/PR → dev, main
実行内容:
  ✅ ESLint (npm run lint)
  ✅ TypeScript型チェック (npm run typecheck)
  ✅ テスト実行 (npm run test)
  ✅ ビルド検証 (npm run build)
  🚀 Vercelデプロイ (mainブランチのみ)
```

## 🔒 Security ([security.yml](security.yml))

```yaml
トリガー: 定期実行 (毎日 0:00 JST)
実行内容:
  🔍 依存関係脆弱性スキャン
  🛡️ セキュリティ監査
  📊 レポート生成
```

## 🔧 設定

### GitHub Secrets

```
VERCEL_TOKEN     # Vercelデプロイ用
ORG_ID          # Vercel組織ID
PROJECT_ID      # VercelプロジェクトID
GITHUB_TOKEN    # 自動設定済み
```

### ローカルテスト

```bash
npm run lint      # コード品質チェック
npm run typecheck # 型チェック
npm run test      # テスト実行
npm run build     # ビルド確認
```

## 🔗 関連ドキュメント

- [コミット規約](../../docs/development/COMMIT_RULES.md)
- [コマンド一覧](../../docs/development/COMMANDS.md)

---

**📖 最終更新**: 2025-10-02 - 一人開発最適化