# Sentryアラート設定ガイド

Sentryダッシュボードでアラート・通知を設定する手順書

## 📋 目次

- [前提条件](#前提条件)
- [基本アラートルール設定](#基本アラートルール設定)
- [Slack通知設定](#slack通知設定)
- [推奨アラート5件の設定](#推奨アラート5件の設定)
- [動作確認](#動作確認)

---

## 前提条件

### 必要なもの
- ✅ Sentryアカウント（Owner または Admin権限）
- ✅ BoxLogプロジェクトが作成済み
- ✅ `.env.local` に `NEXT_PUBLIC_SENTRY_DSN` 設定済み
- ⚠️ Slack連携の場合: Slackワークスペースの管理者権限

### 確認方法

```bash
# ローカル環境でSentry接続確認
npm run sentry:verify

# テストイベント送信
npm run dev
curl http://localhost:3000/api/test/sentry?type=message
```

Sentryダッシュボード（https://sentry.io）でイベントが表示されればOK

---

## 基本アラートルール設定

### 1. Sentryダッシュボードにアクセス

1. https://sentry.io にログイン
2. プロジェクト **boxlog-app** を選択
3. 左サイドバー → **Alerts** をクリック

### 2. 新規アラートルール作成

1. **Create Alert Rule** ボタンをクリック
2. アラートタイプを選択:
   - **Issues**: エラー検知
   - **Metric Alerts**: メトリクス監視（パフォーマンス等）

### 3. アラート設定の基本構造

```
IF [条件]
THEN [アクション]
```

**条件例**:
- `The issue is first seen` - 新規エラー
- `The issue changes state` - エラーの状態変化
- `Number of events in an issue is above X` - エラー回数閾値超過

**アクション例**:
- Send a notification to **Email**
- Send a notification to **Slack**
- Send a notification via **Webhook**

---

## Slack通知設定

### Step 1: Slack統合の有効化

1. Sentryダッシュボード → **Settings** → **Integrations**
2. **Slack** を検索
3. **Add Workspace** をクリック
4. Slackワークスペースを選択して認証

### Step 2: 通知チャンネル設定

1. Alerts設定画面で **Action** セクション
2. **Add Action** → **Send a Slack notification**
3. **Workspace**: 連携したワークスペースを選択
4. **Channel**: 通知先チャンネル（例: `#alerts-production`）

**推奨チャンネル構成**:
```
#alerts-critical     - 緊急アラート（即対応必要）
#alerts-production   - 本番エラー全般
#alerts-performance  - パフォーマンス劣化
#alerts-dev          - 開発・ステージング環境
```

---

## 推奨アラート5件の設定

### 1️⃣ 新規エラー検知

**目的**: 初めて発生したエラーを即座に検知

#### 設定手順

1. **Create Alert Rule** → **Issues**
2. **Alert name**: `🚨 新規エラー検知`
3. **Environment**: `production`（本番のみ）
4. **条件設定**:
   - **When**: `The issue is first seen`
   - **Filter**: `level:error OR level:fatal`

5. **Action**:
   - ✅ Send email to: `your-email@example.com`
   - ✅ Send Slack notification to: `#alerts-critical`

6. **Save Rule**

#### 期待される動作
- 本番環境で初めて発生したエラーを即座に通知
- 開発環境のノイズは除外

---

### 2️⃣ エラー率急増検知

**目的**: 1時間で通常の10倍のエラーが発生した場合に通知

#### 設定手順

1. **Create Alert Rule** → **Metric Alerts**
2. **Alert name**: `📈 エラー率急増`
3. **Environment**: `production`
4. **条件設定**:
   - **Metric**: `count()`
   - **Filter**: `event.type:error`
   - **When**: `the count of errors`
   - **Is**: `above 50` (1時間に50件以上)
   - **Time window**: `1 hour`

5. **Comparison** (オプション):
   - **Compared to**: `1 hour ago`
   - **Increase by**: `10x` (10倍)

6. **Action**:
   - ✅ Send Slack notification to: `#alerts-critical`
   - ✅ Send email to: `your-email@example.com`

7. **Save Rule**

#### 期待される動作
- 急激なエラー増加（例: デプロイ失敗、障害発生）を即座に検知
- 緊急対応が必要なケースを見逃さない

---

### 3️⃣ パフォーマンス劣化検知（LCP/INP）

**目的**: Core Web Vitals が Google 2025基準の「Poor」を超えた場合に通知

#### 設定手順

1. **Create Alert Rule** → **Metric Alerts**
2. **Alert name**: `⚡ パフォーマンス劣化（LCP/INP）`
3. **Environment**: `production`
4. **条件設定（LCP）**:
   - **Metric**: `p75(measurements.lcp)`
   - **When**: `the 75th percentile of LCP`
   - **Is**: `above 4000` (4秒 = Poor閾値)
   - **Time window**: `1 hour`

5. **追加条件（INP）**:
   - **OR**
   - **Metric**: `p75(measurements.inp)`
   - **When**: `the 75th percentile of INP`
   - **Is**: `above 500` (500ms = Poor閾値)
   - **Time window**: `1 hour`

6. **Action**:
   - ✅ Send Slack notification to: `#alerts-performance`

7. **Save Rule**

#### Google 2025基準（参考）
- **LCP**: ≤ 2.5s (Good), > 4.0s (Poor)
- **INP**: ≤ 200ms (Good), > 500ms (Poor)
- **CLS**: < 0.1 (Good), > 0.25 (Poor)
- **FCP**: < 1.8s (Good), > 3.0s (Poor)
- **TTFB**: < 800ms (Good), > 1800ms (Poor)

---

### 4️⃣ クリティカルエラー検知（DB/セキュリティ）

**目的**: データベースエラー・セキュリティエラーの即座検知

#### 設定手順

1. **Create Alert Rule** → **Issues**
2. **Alert name**: `🔴 クリティカルエラー（DB/セキュリティ）`
3. **Environment**: `production`
4. **条件設定**:
   - **When**: `An event is captured`
   - **Filter**:
     ```
     (level:fatal OR level:error)
     AND (tags.category:DB OR tags.category:SECURITY)
     ```

5. **Action**:
   - ✅ Send Slack notification to: `#alerts-critical`
   - ✅ Send email to: `your-email@example.com`
   - ⚠️ **Priority**: High

6. **Save Rule**

#### カテゴリ（BoxLog実装）
`src/config/error-patterns.ts` で定義:
- `DB` - データベースエラー
- `SECURITY` - セキュリティエラー
- `API` - API呼び出しエラー
- `VALIDATION` - バリデーションエラー

---

### 5️⃣ ユーザー影響大（多数ユーザーに影響）

**目的**: 1時間に10人以上のユーザーに影響があるエラーを検知

#### 設定手順

1. **Create Alert Rule** → **Metric Alerts**
2. **Alert name**: `👥 ユーザー影響大`
3. **Environment**: `production`
4. **条件設定**:
   - **Metric**: `count_unique(user)`
   - **When**: `the count of unique users affected`
   - **Is**: `above 10`
   - **Time window**: `1 hour`

5. **Action**:
   - ✅ Send Slack notification to: `#alerts-critical`
   - ✅ **Mention**: `@channel` (全員に通知)

6. **Save Rule**

#### 期待される動作
- 局所的なエラー（1人のユーザーのみ）は無視
- 広範囲に影響があるエラーのみ通知（緊急度高）

---

## 動作確認

### 1. アラートルールのテスト

Sentryダッシュボード → **Alerts** → 作成したルール → **...** → **Test Rule**

### 2. 実際のイベント送信

```bash
# 本番環境でテストイベント送信
npm run dev

# 新規エラーをトリガー
curl http://localhost:3000/api/test/sentry?type=error

# Slackで通知を確認（5分以内）
```

### 3. アラート履歴確認

Sentryダッシュボード → **Alerts** → **History** タブ

- 発火したアラート一覧
- 通知先・時刻の確認

---

## アラート設定のベストプラクティス

### ✅ 推奨事項

1. **環境別フィルタ必須**
   - 本番: `environment:production`
   - ステージング: `environment:preview`
   - 開発環境はアラート不要

2. **段階的な通知**
   - Warning → Slack
   - Critical → Slack + Email + @channel

3. **定期的なレビュー**
   - 月次: アラート発火頻度確認
   - 閾値の調整（誤検知削減）

4. **アラート疲れ対策**
   - 重要度低いアラートは日次サマリーに変更
   - 閾値を適切に設定（最初は緩め → 徐々に厳しく）

### ❌ 避けるべき設定

- ❌ 開発環境のエラーを本番アラートに含める
- ❌ すべてのアラートを @channel で通知（重要度の区別）
- ❌ 閾値を厳しくしすぎてノイズだらけ
- ❌ アラート受信者が不在時の対応未定義

---

## トラブルシューティング

### Slack通知が届かない

**確認項目**:
1. Slack統合が有効か（Settings → Integrations → Slack）
2. チャンネル名が正しいか（`#`なしで入力）
3. Sentryボットがチャンネルに招待されているか

**解決方法**:
```
Slackチャンネルで:
/invite @Sentry
```

### アラートが発火しない

**確認項目**:
1. 条件式が正しいか（Test Ruleで確認）
2. Environmentフィルタが正しいか
3. 実際にエラーが発生しているか（Issues タブで確認）

**デバッグ方法**:
```bash
# テストイベント送信
curl http://localhost:3000/api/test/sentry?type=error

# Sentryダッシュボード → Issues で確認
# → 条件にマッチするか手動チェック
```

### 誤検知が多い

**対策**:
1. 閾値を緩める（例: 50件 → 100件）
2. 時間窓を広げる（例: 1時間 → 6時間）
3. Environmentフィルタを厳しく（`production` のみ）
4. 特定エラーを除外（`AND NOT message:"Expected error"`）

---

## 次のステップ

### 1. アラートルールの作成

上記の推奨アラート5件を設定:
- [ ] 新規エラー検知
- [ ] エラー率急増
- [ ] パフォーマンス劣化（LCP/INP）
- [ ] クリティカルエラー（DB/セキュリティ）
- [ ] ユーザー影響大

### 2. Slack通知設定

- [ ] Slackワークスペース連携
- [ ] 通知チャンネル作成（#alerts-critical, #alerts-production等）
- [ ] Sentryボットを各チャンネルに招待

### 3. 本番環境で動作確認

- [ ] Vercelにデプロイ
- [ ] 本番URLでテストイベント送信
- [ ] Slackで通知受信確認

### 4. 運用開始

- [ ] チームメンバーにアラートルール共有
- [ ] オンコール体制の確立（誰が対応するか）
- [ ] 月次レビュー会議設定

---

## 関連ドキュメント

- **Sentry統合ガイド**: [`SENTRY.md`](./SENTRY.md)
- **エラーパターン辞書**: [`../../src/config/error-patterns.ts`](../../src/config/error-patterns.ts)
- **Sentry公式ドキュメント**: https://docs.sentry.io/product/alerts/

---

**📖 最終更新**: 2025-10-08 | **作成者**: Claude Code
**対象Issue**: #489 - Sentryエラー監視の完全実装
