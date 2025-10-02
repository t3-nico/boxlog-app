# 🤖 GitHub Actions ワークフロー

BoxLog Appの自動化されたCI/CDシステム（一人開発最適化版）

## 📋 ワークフロー構成

| ワークフロー | ファイル | トリガー | 役割 |
|------------|---------|---------|------|
| **CI/CD** | [`ci.yml`](ci.yml) | Push/PR (dev,main) | lint + typecheck + test + build |
| **Bundle Check** | [`bundle-check.yml`](bundle-check.yml) | PR作成時 | バンドルサイズ監視 |

## 🚀 CI/CD ([ci.yml](ci.yml))

**Phase 1: Quick Checks (並列実行)**
- ✅ ESLint + Prettier
- ✅ TypeScript型チェック
- ✅ ユニットテスト (カバレッジ付き)

**Phase 2: Quality Checks (並列実行)**
- 🏗️ Next.jsビルド
- ♿ アクセシビリティチェック
- 🔍 Heavy Analysis (ライセンス/API/パフォーマンス)
- 📚 ドキュメント整合性

**Phase 3: Quality Gate**
- 🚪 全チェック結果集約
- 💬 PR Summary自動投稿

## 📦 Bundle Check ([bundle-check.yml](bundle-check.yml))

- 📏 バンドルサイズ分析
- 💬 PRコメント自動投稿
- ⚠️ サイズ増加アラート

## 🔧 GitHub Secrets

```
VERCEL_TOKEN     # Vercelデプロイ用
ORG_ID          # Vercel組織ID
PROJECT_ID      # VercelプロジェクトID
CODECOV_TOKEN   # Codecovカバレッジ
```

## 🧪 ローカルテスト

```bash
npm run lint      # コード品質チェック
npm run typecheck # 型チェック
npm run test      # テスト実行
npm run build     # ビルド確認
```

---

**📖 最終更新**: 2025-10-02 - 2ワークフロー構成に最適化
