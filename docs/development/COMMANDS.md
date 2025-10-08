# BoxLog 開発コマンド一覧

## 🚀 基本開発コマンド（頻出4個）

```bash
npm run dev                 # 開発サーバー起動
npm run lint                # コード品質チェック
npm run typecheck           # 型チェック
npm run docs:check          # ドキュメント整合性チェック
```

---

## 📋 全コマンド一覧

### === 基本コマンド ===
```bash
npm run dev                 # next dev
npm run build               # next build
npm run start               # next start
npm run typecheck           # tsc --noEmit
```

### === コード品質管理コマンド ===
```bash
npm run lint                # ESLint全品質チェック
npm run lint:fix            # 自動修正可能な問題を修正
npm run lint:a11y           # アクセシビリティ専用チェック
```

### === デプロイ履歴管理コマンド ===
```bash
npm run deploy:init         # デプロイ履歴ファイルの初期化
npm run deploy:record       # デプロイの記録
npm run deploy:stats        # デプロイ統計情報の表示
npm run deploy:list         # デプロイ履歴の一覧表示
npm run deploy:export       # 履歴データのエクスポート（JSON/CSV）
npm run deploy:pre          # デプロイ前チェック（品質・環境・依存関係）
npm run deploy:post         # デプロイ後処理（記録・通知・ヘルスチェック）
npm run deploy:full         # 完全デプロイフロー（前処理→ビルド→記録→後処理）
```

### === アナリティクス・メトリクス管理コマンド ===
```bash
npm run analytics:validate  # イベント名の検証・命名規則チェック
npm run analytics:report    # 詳細レポート生成（JSON出力）
npm run analytics:unused    # 未使用イベントの一覧表示
npm run analytics:stats     # 基本統計情報（使用率・カテゴリ別）
npm run analytics:check     # 完全検証（validateと同じ）
```

### === API バージョニング管理コマンド ===
```bash
npm run api:version:test      # 包括的APIバージョニングテスト
npm run api:version:health    # API健康チェック
npm run api:version:versioning # バージョニング機能テスト
npm run api:version:stats     # API統計情報確認
npm run api:version:cors      # CORS設定テスト
npm run api:version:full      # 完全なAPI管理テスト
```

### === 設定ファイル管理コマンド ===
```bash
npm run config:validate       # 設定ファイルのバリデーション
npm run config:compare        # 環境別設定の比較表示
npm run config:docs           # スキーマドキュメント自動生成
npm run config:stats          # 設定ファイルの統計情報
npm run config:check          # 基本的な設定チェック
npm run config:full           # 完全な設定管理（検証・比較・統計・ドキュメント生成）
```

### === ログシステム管理コマンド ===
```bash
npm run logs:analyze          # ログファイルの詳細分析
npm run logs:alert            # ログベースのアラートチェック
npm run logs:watch            # リアルタイムログ監視
npm run logs:report           # 分析レポート生成（JSON）
npm run logs:csv              # 分析レポート生成（CSV）
```

### === Breaking Change管理コマンド（v1.1.0追加） ===
```bash
npm run breaking:detect       # Git diffから破壊的変更を自動検知
npm run breaking:record       # 破壊的変更の手動記録
npm run breaking:validate     # BREAKING_CHANGES.mdの妥当性検証
npm run breaking:init         # Breaking Change管理システムの初期化
npm run breaking:check        # 直近のコミットからの変更チェック
npm run breaking:analyze      # 詳細影響分析・マイグレーション計画生成
npm run breaking:impact       # 影響分析レポートの生成
npm run breaking:report       # 詳細レポートの再生成（既存データから）
npm run breaking:notify       # チーム通知の送信（Slack/Discord/GitHub Issue）
npm run breaking:plan         # マイグレーション計画書の生成
npm run breaking:full         # 完全フロー（検知→分析→記録）
```

### === ビジネスルール辞書システム管理コマンド（v2.0.0追加） ===
```bash
npm run generate:business-rules       # バリデーション・型・スキーマ自動生成
npm run business-rules:test           # 基盤・統合テスト実行
npm run business-rules:generate-and-test # コード生成・テスト統合実行
npm run business-rules:full           # 完全ビジネスルール管理フロー
```

### === ドキュメント品質管理コマンド ===
```bash
npm run docs:check        # 整合性チェック
npm run docs:fix-and-check # 自動修正→チェック（推奨）
```

### === Conventional Commits管理コマンド ===
```bash
npm run changelog:generate    # 増分CHANGELOG生成
npm run changelog:release     # 全体CHANGELOG生成
npm run commit:feat          # 新機能コミット補助
npm run commit:fix           # バグ修正コミット補助
npm run commit:docs          # ドキュメントコミット補助
npm run log:feat             # 機能追加ログのみ表示
npm run log:fix              # バグ修正ログのみ表示
npm run log:type             # 型別コミット一覧（最新20件）
```

### === Issue管理コマンド ===
```bash
npm run issue:start "機能名: 実装内容"   # 新しい作業開始
npm run issue:progress "作業内容の詳細" # 進捗更新
npm run issue:complete "完了内容とテスト結果" # 完了報告
```

---

## 🔗 関連ドキュメント

- **Issue管理**: [`ISSUE_MANAGEMENT.md`](./ISSUE_MANAGEMENT.md)
- **セッション管理**: [`CLAUDE_SESSION_MANAGEMENT.md`](./CLAUDE_SESSION_MANAGEMENT.md)

---

**📖 参照元**: [CLAUDE.md](../../CLAUDE.md)
**最終更新**: 2025-09-30