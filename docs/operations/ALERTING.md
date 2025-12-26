# BoxLog アラート設定ガイド

> Sentryアラートルールの設定手順と運用ガイド

## アラートルール一覧

### 1. エラー率アラート（Critical）

| 項目       | 設定値                |
| ---------- | --------------------- |
| 条件       | エラー数 > 10件 / 5分 |
| 通知先     | Slack #boxlog-alerts  |
| アクション | 即時対応必須          |

**Sentry設定手順:**

1. Sentry Dashboard → Alerts → Create Alert
2. Issue Alert を選択
3. 条件: `When an issue is first seen and matches: level:error`
4. アクション: Slack通知 + 担当者アサイン

### 2. パフォーマンス劣化アラート（Warning）

| 項目       | 設定値                    |
| ---------- | ------------------------- |
| 条件       | p95レイテンシ > 1000ms    |
| 通知先     | Slack #boxlog-performance |
| アクション | 24時間以内に調査          |

**Sentry設定手順:**

1. Alerts → Create Alert → Metric Alert
2. 条件: `transaction.duration:p95 > 1000`
3. Trigger: Warning at 1000ms, Critical at 2000ms

### 3. SLO違反アラート（Critical）

| 項目       | 設定値                           |
| ---------- | -------------------------------- |
| 条件       | エラー率 > 0.5% / 1時間          |
| 通知先     | Slack #boxlog-alerts + PagerDuty |
| アクション | 即時対応必須                     |

### 4. 認証エラーアラート（High）

| 項目       | 設定値                     |
| ---------- | -------------------------- |
| 条件       | 認証エラー > 50件 / 10分   |
| 通知先     | Slack #boxlog-security     |
| アクション | 不正アクセスの可能性を調査 |

## Slack Webhook設定

### 1. Slack Appの作成

```
1. https://api.slack.com/apps にアクセス
2. Create New App → From scratch
3. App Name: BoxLog Alerts
4. Workspace: 対象のワークスペース
```

### 2. Incoming Webhookの有効化

```
1. Features → Incoming Webhooks → On
2. Add New Webhook to Workspace
3. チャンネル選択: #boxlog-alerts
4. Webhook URLをコピー
```

### 3. Sentryへの設定

```
1. Sentry → Settings → Integrations → Slack
2. Connect to Slack
3. 認証を完了
4. Alert Rulesで通知チャンネルを設定
```

## アラートエスカレーション

| レベル      | 条件           | 対応時間   | エスカレーション |
| ----------- | -------------- | ---------- | ---------------- |
| P1 Critical | サービス停止   | 15分以内   | 即座にオンコール |
| P2 High     | 主要機能障害   | 1時間以内  | 30分後にリード   |
| P3 Medium   | 軽微な障害     | 4時間以内  | 翌営業日         |
| P4 Low      | パフォーマンス | 24時間以内 | 週次レビュー     |

## オンコール体制

### ローテーション

- 週次でローテーション
- 平日: 9:00-21:00 プライマリ担当
- 夜間/休日: セカンダリ待機

### 連絡方法

1. Slackで一次通知
2. 15分応答なし → 電話
3. さらに15分応答なし → エスカレーション

## 改訂履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2025-12-26 | v1.0       | 初版作成 |
