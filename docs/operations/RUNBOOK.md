# BoxLog Runbook（障害対応手順書）

> 障害発生時の対応手順と復旧ガイド

## 障害対応フロー

```
1. 検知 → 2. 初期対応 → 3. 調査 → 4. 復旧 → 5. 事後対応
```

## シナリオ別対応手順

---

### RB-001: サービス全体がダウン

**症状:**

- 全ページで500エラー
- Vercelステータスがダウン

**初期対応（5分以内）:**

```bash
# Vercelの状態確認
curl -I https://boxlog.app/api/health

# Vercel Dashboard確認
# https://vercel.com/dashboard
```

**調査:**

1. Vercel Dashboardでデプロイステータス確認
2. Sentryでエラー内容確認
3. 直近のデプロイを特定

**復旧:**

```bash
# 前回の正常デプロイにロールバック
# Vercel Dashboard → Deployments → 正常なデプロイ → Promote to Production
```

**エスカレーション:** 15分で復旧しない場合 → Vercel Supportに連絡

---

### RB-002: 認証が機能しない

**症状:**

- ログイン/サインアップが失敗
- 401エラーが多発

**初期対応:**

```bash
# Supabase状態確認
curl -I https://[project-ref].supabase.co/auth/v1/health
```

**調査:**

1. Supabase Dashboardで認証ログ確認
2. 環境変数が正しいか確認
3. JWTトークンの有効期限確認

**復旧:**

- Supabase側の問題 → Supabaseステータスページ確認、待機
- 環境変数の問題 → Vercel環境変数を修正し再デプロイ

---

### RB-003: データベース接続エラー

**症状:**

- データの読み書きが失敗
- `Connection refused`エラー

**初期対応:**

```bash
# Supabase DB状態確認
# https://app.supabase.com → Project → Database → Health
```

**調査:**

1. 接続プール枯渇の確認
2. クエリパフォーマンス確認
3. ストレージ使用量確認

**復旧:**

- 接続プール枯渇 → サーバーレス関数のタイムアウト調整
- パフォーマンス問題 → 問題クエリの特定と最適化

---

### RB-004: パフォーマンス劣化

**症状:**

- ページ読み込みが遅い
- LCP > 4秒

**初期対応:**

```bash
# Web Vitals確認
# Sentry → Performance → Web Vitals
```

**調査:**

1. Sentry Performance Dashboardで遅いトランザクション特定
2. 特定のページ/APIが遅いか全体的か
3. 直近のデプロイとの相関

**復旧:**

- 特定エンドポイント → キャッシュ追加、クエリ最適化
- 全体的 → 前回デプロイにロールバック

---

### RB-005: 大量のJSエラー

**症状:**

- Sentryでフロントエンドエラーが急増
- 特定の機能が動作しない

**初期対応:**

```bash
# Sentryでエラートレンド確認
# Sentry → Issues → Sort by Frequency
```

**調査:**

1. 影響を受けているブラウザ/デバイス特定
2. エラースタックトレース分析
3. 直近のコード変更確認

**復旧:**

- 明確なバグ → ホットフィックスPR
- 複雑な問題 → 前回デプロイにロールバック

---

### RB-006: 外部サービス障害（Supabase, Vercel等）

**症状:**

- 外部サービスからのエラー
- タイムアウト

**初期対応:**

1. ステータスページ確認
   - Supabase: https://status.supabase.com
   - Vercel: https://www.vercel-status.com

**対応:**

- サービス側の問題 → 待機、ユーザーへの告知
- 部分障害 → 機能を一時的に無効化（フィーチャーフラグ）

---

## 事後対応

### ポストモーテム テンプレート

障害復旧後、24時間以内に作成:

```markdown
# インシデントレポート: [タイトル]

## 概要

- 発生日時: YYYY-MM-DD HH:MM
- 復旧日時: YYYY-MM-DD HH:MM
- 影響範囲: [ユーザー数、機能]
- 重要度: P1/P2/P3/P4

## タイムライン

- HH:MM - 検知
- HH:MM - 初期対応開始
- HH:MM - 原因特定
- HH:MM - 復旧完了

## 根本原因

[詳細な原因分析]

## 再発防止策

- [ ] アクション1
- [ ] アクション2

## 学んだこと

[改善点、良かった点]
```

---

## 連絡先

| 役割             | 担当           | 連絡方法            |
| ---------------- | -------------- | ------------------- |
| オンコール       | ローテーション | Slack @oncall       |
| テックリード     | -              | Slack DM            |
| Vercel Support   | -              | support@vercel.com  |
| Supabase Support | -              | support@supabase.io |

## 改訂履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2025-12-26 | v1.0       | 初版作成 |
