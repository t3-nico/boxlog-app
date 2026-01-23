# PR品質チェックリスト

BoxLogアプリケーションのプルリクエスト時の品質確保のためのチェックリストです。

## 🚀 クイックスタート

```bash
# PR品質チェック（推奨）
npm run pr:check

# 完全品質チェック（重要な変更時）
npm run pr:full

# 個別チェック
npm run pr:lint      # ESLint + TypeScript
npm run pr:test      # テスト実行
npm run pr:build     # ビルド確認
npm run pr:security  # セキュリティチェック
```

## 📋 自動チェック項目 ✅

### 基本品質ゲート

- [ ] **TypeScript**: `npm run typecheck` - エラー0
- [ ] **ESLint**: `npm run lint` - 警告0、エラー0
- [ ] **Prettier**: `npm run lint:fix` - フォーマット済み
- [ ] **テスト**: `npm run test:run` - 全パス
- [ ] **ビルド**: `npm run build` - 成功

### Bundle・パフォーマンス

- [ ] **Bundle Size**: `npm run bundle:check` - +10KB以内
- [ ] **Bundle監視**: `npm run bundle:monitor` - 異常なし
- [ ] **依存関係**: `npm run license:check` - ライセンス準拠

### セキュリティ

- [ ] **脆弱性監査**: `npm run secrets:check` - 秘密情報なし
- [ ] **npm audit**: `npm audit --level moderate` - 中程度以上の脆弱性0
- [ ] **環境変数**: `.env.local`にハードコードなし

## 🔍 手動確認項目 👀

### パフォーマンス指標 🚀

#### Lighthouse Performance

```bash
# 開発サーバー起動後
npm run smart:dev
# 別ターミナルで Lighthouse 実行
npx lighthouse http://localhost:3000 --only-categories=performance
```

**目標値:**

- [ ] **Performance Score**: 90以上
- [ ] **First Contentful Paint**: 1.5秒以内
- [ ] **Largest Contentful Paint**: 2.5秒以内
- [ ] **Cumulative Layout Shift**: 0.1以下

#### 初期表示・レスポンス

- [ ] **初回ページロード**: 1秒以内（キャッシュなし）
- [ ] **ページ遷移**: 300ms以内
- [ ] **メモリリーク**: DevToolsで確認、継続的なメモリ増加なし

### アクセシビリティ確認 ♿

#### キーボード操作

```bash
# アクセシビリティ専用チェック
npm run a11y:check
```

**手動確認項目:**

- [ ] **Tab順序**: 論理的な順序でフォーカス移動
- [ ] **全機能アクセス**: マウスなしで全機能利用可能
- [ ] **フォーカス表示**: 現在位置が明確に視覚化
- [ ] **キーボードトラップ**: 適切なフォーカス管理

#### ARIA・セマンティック

- [ ] **aria-label**: インタラクティブ要素に適切な説明
- [ ] **見出し構造**: h1〜h6の階層が適切
- [ ] **カラーコントラスト**: WCAG AA準拠（4.5:1以上）
- [ ] **代替テキスト**: 画像に適切なalt属性

### セキュリティ確認 🔒

#### XSS・インジェクション対策

- [ ] **ユーザー入力**: 全てエスケープ処理済み
- [ ] **innerHTML使用**: `dangerouslySetInnerHTML`使用時の妥当性確認
- [ ] **外部リンク**: `rel="noopener noreferrer"`設定
- [ ] **CSP準拠**: Content Security Policy違反なし

#### 認証・認可

- [ ] **JWT処理**: 適切なトークン検証
- [ ] **ルートガード**: 未認証時の適切なリダイレクト
- [ ] **権限チェック**: 機能レベルでの適切な権限確認

## 📝 ドキュメント確認

### コードドキュメント

- [ ] **JSDoc**: 新規関数・コンポーネントにコメント記載
- [ ] **README更新**: 機能追加時のドキュメント更新
- [ ] **型定義**: 複雑な型に適切なコメント

### 品質記録

```bash
# ドキュメント一貫性チェック
npm run docs:check
```

- [ ] **変更内容記録**: 主要な変更をCLAUDE.mdに記録
- [ ] **技術的判断**: 設計決定の理由を記録
- [ ] **既知の制限**: 制約事項や回避策を文書化

## 🎯 品質基準・KPI

### 自動チェック合格基準

| 項目         | 基準            | コマンド                |
| ------------ | --------------- | ----------------------- |
| TypeScript   | エラー0         | `npm run typecheck`     |
| ESLint       | 警告0・エラー0  | `npm run lint`          |
| テスト       | 全パス          | `npm run test:run`      |
| Bundle Size  | 前回比+10KB以内 | `npm run bundle:check`  |
| セキュリティ | 脆弱性0         | `npm run secrets:check` |

### パフォーマンス基準

| 指標                   | 目標値   | 測定方法         |
| ---------------------- | -------- | ---------------- |
| Lighthouse Performance | 90以上   | 手動実行         |
| 初期表示時間           | 1秒以内  | DevTools Network |
| バンドルサイズ増加     | 10KB以内 | 自動監視         |
| メモリリーク           | なし     | DevTools Memory  |

### アクセシビリティ基準

| 項目               | 基準               | 確認方法           |
| ------------------ | ------------------ | ------------------ |
| キーボード操作     | 全機能アクセス可能 | 手動テスト         |
| カラーコントラスト | WCAG AA（4.5:1）   | 自動チェック       |
| ARIA実装           | 適切なラベル設定   | スクリーンリーダー |
| セマンティックHTML | 正しい要素使用     | HTMLバリデーター   |

## 🔄 PR提出前の最終確認

### 1. 統合品質チェック

```bash
# 全自動チェック実行
npm run pr:full

# 品質ゲートレポート確認
cat .quality-gate-report.json | jq '.overall.status'
```

### 2. 手動テストチェックリスト

- [ ] 主要機能の動作確認
- [ ] エラーハンドリングの確認
- [ ] レスポンシブデザインの確認
- [ ] 異なるブラウザでの動作確認

### 3. コミット品質

- [ ] **コミットメッセージ**: Conventional Commits準拠
- [ ] **コミット粒度**: 論理的な単位での分割
- [ ] **ブランチ名**: `feature/`, `fix/`等の適切なプレフィックス

### 4. Claude Code Review（推奨）

PR作成後、Claude Code で自動レビューを実行:

```bash
# PRレビュー（ターミナル出力）
/code-review

# PRにコメント投稿
/code-review --comment
```

**チェック内容:**

- [ ] CLAUDE.md 準拠
- [ ] バグ検出（Opus使用）
- [ ] セキュリティ問題
- [ ] 信頼度80%以上の問題のみ報告

> **Note**: Maxプラン内で実行可能。新しいセッションで実行すること。

## 🚨 問題発生時の対応

### 品質チェック失敗時

```bash
# 詳細情報確認
npm run quality:gate:verbose

# 個別問題の調査
npm run lint:report          # ESLint詳細レポート
npm run bundle:check:verbose # Bundle詳細分析
npm run secrets:check:verbose # セキュリティ詳細
```

### パフォーマンス問題

```bash
# パフォーマンス分析
npm run bundle:analyze       # Bundle分析
npm run perf:check          # パフォーマンス回帰テスト
```

### CI/CD連携

BoxLogの品質ゲートはCI/CD実行時にも同様のチェックが実行されます：

```bash
# .husky/pre-commit で自動実行
npm run pr:check

# .husky/pre-push で最終確認
npm run quality:gate
```

## 📊 品質メトリクス詳細

### A. 自動メトリクス（数値化）

- **コード品質スコア**: ESLint + TypeScript結果
- **テストカバレッジ**: 80%以上必須
- **バンドルサイズ効率**: 増加率10%以内
- **セキュリティスコア**: 脆弱性0必須

### B. 手動メトリクス（チェックリスト）

- **UX品質**: パフォーマンス・アクセシビリティ
- **コード可読性**: JSDoc・設計文書
- **運用品質**: エラーハンドリング・ログ出力

## 🎓 関連ドキュメント

- [包括的品質ゲートシステム](./session-templates/QUALITY_CHECKLIST.md)
- [Bundle監視システム](../performance/BUNDLE_MONITORING.md)

---

**📖 このドキュメントについて**
BoxLog PR品質メトリクス v1.0
最終更新: 2025-09-25
関連Issue: [品質メトリクスの作成 #56](https://github.com/t3-nico/boxlog-app/issues/56)

---

**種類**: 📙 リファレンス
**最終更新**: 2026-01-19
**所有者**: BoxLog 開発チーム
