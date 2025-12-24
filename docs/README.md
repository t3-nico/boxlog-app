# BoxLog App - ドキュメントポータル

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

## 📖 ドキュメント分類 (Diataxis Framework)

### 📘 チュートリアル (Tutorial) - 学習向け

**初めての方が順序立てて学ぶためのガイド**

| ドキュメント                                        | 対象者     | 所要時間 |
| --------------------------------------------------- | ---------- | -------- |
| [セットアップガイド](./setup/README.md)             | 新規開発者 | 30分     |
| [Supabase Auth設定](./setup/SUPABASE_AUTH_SETUP.md) | 認証実装者 | 15分     |
| [認証テストガイド](./setup/AUTH_TESTING_GUIDE.md)   | QA担当者   | 10分     |

### 📗 ハウツーガイド (How-to) - 実践向け

**特定の課題を解決するためのステップバイステップ手順**

| カテゴリ     | ドキュメント                                                     | 解決する課題             |
| ------------ | ---------------------------------------------------------------- | ------------------------ |
| **開発環境** | [Cursor AI統合](./setup/CURSOR_SETUP.md)                         | AI支援開発の設定         |
| **AI活用**   | [Claude 4ベストプラクティス](./development/CLAUDE_4_BEST_PRACTICES.md) | Claude Codeの効果的な活用 |
| **デプロイ** | [Vercel設定](./setup/VERCEL_SETUP.md)                            | 本番環境構築             |
| **CI/CD**    | [パイプライン設定](./setup/CI_CD_SETUP.md)                       | 自動化ワークフロー       |
| **品質管理** | [ESLint設定](./development/ESLINT_HYBRID_APPROACH.md)            | コード品質確保           |
| **監視**     | [Sentry統合](./integrations/SENTRY.md)                           | エラー監視導入           |
| **テーマ**   | [テーマ移行](./design-system/THEME_MIGRATION.md)                 | UI統一化                 |

### 📙 リファレンス (Reference) - 参照向け

**技術仕様・API・設定値の詳細情報**

| カテゴリ     | ドキュメント                                                | 内容                    |
| ------------ | ----------------------------------------------------------- | ----------------------- |
| **コマンド** | [コマンド一覧](./development/COMMANDS.md)                   | npm scripts全量         |
| **デザイン** | [スタイルガイド](./design-system/STYLE_GUIDE.md)            | 8pxグリッド・色・タイポ |
| **エラー**   | [エラーパターン](./architecture/ERROR_PATTERNS_GUIDE.md)    | エラーコード体系        |
| **API**      | [APIバリデーション](./architecture/API_VALIDATION_GUIDE.md) | API仕様・検証ルール     |
| **Issue**    | [Issue管理ルール](./development/ISSUE_MANAGEMENT.md)        | ラベル・テンプレート    |
| **PR**       | [PRテンプレート](./development/PR_TEMPLATE.md)              | プルリクエスト規約      |
| **リリース** | [リリースプロセス](./releases/RELEASE_PROCESS.md)           | バージョニング規約      |

### 📕 解説 (Explanation) - 理解向け

**アーキテクチャ・設計思想の背景説明**

| カテゴリ       | ドキュメント                                                        | 解説内容                 |
| -------------- | ------------------------------------------------------------------- | ------------------------ |
| **エラー設計** | [エラーハンドリング](./architecture/ERROR_HANDLING.md)              | 統一エラーシステムの設計 |
| **UI設計**     | [デザインシステム概要](./design-system/README.md)                   | デザイントークン体系     |
| **状態管理**   | [状態管理ガイド](./architecture/STATE_MANAGEMENT_DECISION_GUIDE.md) | Zustand選定理由          |
| **品質戦略**   | [品質システム](./development/QUALITY_SYSTEM_README.md)              | 品質保証の全体像         |

---

## 🚀 クイックスタート

### 役割別ナビゲーション

| 役割               | 最初に読むべきドキュメント                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **新規開発者**     | [セットアップ](./setup/README.md) → [コマンド一覧](./development/COMMANDS.md) → [スタイルガイド](./design-system/STYLE_GUIDE.md) |
| **フロントエンド** | [デザインシステム](./design-system/README.md) → [エラーハンドリング](./architecture/ERROR_HANDLING.md)                           |
| **バックエンド**   | [APIバリデーション](./architecture/API_VALIDATION_GUIDE.md) → [Supabase設定](./setup/SUPABASE_AUTH_SETUP.md)                     |
| **QA/テスト**      | [認証テスト](./setup/AUTH_TESTING_GUIDE.md) → [テスティング](./testing/README.md)                                                |
| **リリース担当**   | [リリースチェックリスト](./releases/RELEASE_CHECKLIST.md) → [バージョニング](./releases/VERSIONING.md)                           |

---

## 🎯 技術スタック

| レイヤー           | 技術                              |
| ------------------ | --------------------------------- |
| **フレームワーク** | Next.js 14 (App Router), React 18 |
| **言語**           | TypeScript (strict mode)          |
| **データベース**   | Supabase (PostgreSQL + RLS)       |
| **UIライブラリ**   | shadcn/ui, Tailwind CSS v4        |
| **状態管理**       | Zustand, TanStack Query           |
| **API**            | tRPC v11                          |
| **品質管理**       | ESLint, Vitest, Playwright        |
| **監視**           | Sentry                            |

---

## 📁 ディレクトリ構造

```
docs/
├── architecture/     # 📕 解説: システム設計・アーキテクチャ
├── design-system/    # 📙 リファレンス + 📕 解説: UI/UXガイド
├── development/      # 📗 ハウツー + 📙 リファレンス: 開発ワークフロー
├── features/         # 📕 解説: 機能仕様
├── integrations/     # 📗 ハウツー: 外部サービス統合
├── legal/            # 📙 リファレンス: ライセンス・コンプライアンス
├── performance/      # 📙 リファレンス: パフォーマンス基準
├── releases/         # 📙 リファレンス + 📗 ハウツー: リリース管理
├── security/         # 📙 リファレンス: セキュリティ設定
├── setup/            # 📘 チュートリアル + 📗 ハウツー: 環境構築
├── testing/          # 📗 ハウツー: テスト戦略
└── archive/          # 📦 アーカイブ: 過去の記録
```

---

## 🔗 関連リソース

### コード内ドキュメント (コロケーション)

| 機能                   | 場所                           |
| ---------------------- | ------------------------------ |
| **CLAUDE.md (AI指針)** | `/CLAUDE.md`, `/src/CLAUDE.md` |
| **コンポーネント**     | `/src/components/CLAUDE.md`    |
| **機能モジュール**     | `/src/features/CLAUDE.md`      |
| **ESLint設定**         | `/.eslint/README.md`           |

### 外部リンク

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Tailwind CSS公式](https://tailwindcss.com/docs)

---

## 📊 ドキュメント品質

| 指標             | 値                                |
| ---------------- | --------------------------------- |
| 総ドキュメント数 | 78 (アクティブ) + 13 (アーカイブ) |
| 整合性スコア     | 91.7%                             |
| 最終チェック     | 2025-12-11                        |

---

**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
**バージョン**: v5.0 - Diataxis Framework適用
