# BoxLog セキュリティ現状レポート

> 最終更新: 2025-12-26 | スコア: 85/100

## 概要

BoxLogのセキュリティ対策の現状と、改善が必要な項目をまとめたドキュメントです。

## セキュリティスコア

| カテゴリ         | スコア     | 状態        |
| ---------------- | ---------- | ----------- |
| 認証・認可       | 8/10       | ✅ 良好     |
| データ保護       | 9/10       | ✅ 良好     |
| API セキュリティ | 9/10       | ✅ 良好     |
| フロントエンド   | 8/10       | ✅ 良好     |
| 依存関係管理     | 8/10       | ✅ 良好     |
| CI/CD            | 9/10       | ✅ 良好     |
| **総合**         | **85/100** | **✅ 良好** |

---

## 1. 認証・認可 (8/10)

### 実装済み

| 対策                 | 実装                | 詳細                       |
| -------------------- | ------------------- | -------------------------- |
| **認証基盤**         | Supabase Auth       | JWT + リフレッシュトークン |
| **セッション管理**   | Server-side Cookie  | HttpOnly, Secure, SameSite |
| **認証ミドルウェア** | `src/middleware.ts` | 保護パスへのアクセス制御   |
| **RLS**              | 有効                | ユーザーデータの完全分離   |
| **tRPC 権限階層**    | 実装済み            | public / protected / admin |
| **ログイン試行制限** | 実装済み            | 5回/15分でロックアウト     |

### 保護されているパス

```
認証必須: /tasks, /settings, /calendar, /box, /table, /board, /stats
公開: /, /about, /privacy, /terms, /contact, /pricing
```

### 未実装

- [ ] MFA（多要素認証）- ルーティングのみ設定済み

---

## 2. データ保護 (9/10)

### 実装済み

| 対策                 | 実装         | 詳細                          |
| -------------------- | ------------ | ----------------------------- |
| **暗号化**           | Supabase管理 | データベース暗号化（at-rest） |
| **通信暗号化**       | TLS 1.3      | Vercel + Supabase             |
| **環境変数分離**     | 実装済み     | 公開キー / サービスキー分離   |
| **監査ログ**         | 実装済み     | `audit_logs` テーブル         |
| **ログイン試行記録** | 実装済み     | 24時間で自動削除              |

### 環境変数の分類

```
公開可能（NEXT_PUBLIC_*）:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SENTRY_DSN

機密（サーバーのみ）:
- SUPABASE_SERVICE_ROLE_KEY
- SENTRY_AUTH_TOKEN
```

---

## 3. API セキュリティ (9/10)

### 実装済み

| 対策                   | 実装                  | 詳細                           |
| ---------------------- | --------------------- | ------------------------------ |
| **入力バリデーション** | Zod                   | 全 tRPC エンドポイント         |
| **厳格モード**         | `z.object().strict()` | 未知プロパティ拒否             |
| **Rate Limiting**      | Upstash Redis         | Sliding Window 方式            |
| **エラー情報制限**     | 実装済み              | 本番ではスタックトレース非表示 |

### Rate Limit 設定

| エンドポイント     | 制限              |
| ------------------ | ----------------- |
| 一般 API           | 10リクエスト/10秒 |
| ログイン           | 5リクエスト/15分  |
| パスワードリセット | 3リクエスト/1時間 |

---

## 4. フロントエンド セキュリティ (8/10)

### 実装済み

| 対策                   | 実装                            | 詳細            |
| ---------------------- | ------------------------------- | --------------- |
| **XSS 対策**           | React 自動エスケープ            | デフォルト有効  |
| **CSP**                | 実装済み                        | next.config.mjs |
| **Clickjacking 対策**  | X-Frame-Options: DENY           |                 |
| **MIME Sniffing 対策** | X-Content-Type-Options          | nosniff         |
| **HSTS**               | 有効                            | 2年間 + preload |
| **Referrer Policy**    | strict-origin-when-cross-origin |                 |

### Content Security Policy

```
default-src 'self'
script-src 'self' 'unsafe-inline' vercel.live va.vercel-scripts.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob:
frame-ancestors 'none'
```

### 改善予定

- [ ] nonce-based CSP への移行（Next.js 15.x 対応後）

---

## 5. 依存関係管理 (8/10)

### 実装済み

| 対策                   | 実装       | 詳細                   |
| ---------------------- | ---------- | ---------------------- |
| **脆弱性スキャン**     | npm audit  | 毎週月曜自動実行       |
| **自動更新**           | Dependabot | Minor/Patch 自動マージ |
| **ライセンスチェック** | 実装済み   | 週次実行               |

### Dependabot 設定

```yaml
# 自動更新対象
- npm dependencies（週1回）
- GitHub Actions（週1回）

# 除外
- Major バージョン更新（手動対応）
```

### 対応方針

| 深刻度   | 対応期限     |
| -------- | ------------ |
| Critical | 24時間以内   |
| High     | 1週間以内    |
| Medium   | 次回リリース |
| Low      | 計画的対応   |

---

## 6. CI/CD セキュリティ (9/10)

### 実装済み

| 対策                 | 実装                 | 詳細                     |
| -------------------- | -------------------- | ------------------------ |
| **シークレット管理** | GitHub Secrets       | 環境別分離               |
| **最小権限**         | permissions ブロック | 必要な権限のみ付与       |
| **ブランチ保護**     | 有効                 | Quality Gate 必須        |
| **Actions SHA固定**  | 実装済み             | サプライチェーン攻撃対策 |

### ワークフロー権限例

```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

---

## 比喩で理解するセキュリティ

### 🏠 「家のセキュリティ」に例えると

| 対策              | 家で言うと                           |
| ----------------- | ------------------------------------ |
| **認証**          | 玄関の鍵（Supabase Auth）            |
| **RLS**           | 各部屋の鍵（自分の部屋しか入れない） |
| **Rate Limiting** | ドアチャイム制限（連続で押せない）   |
| **CSP**           | 窓の格子（外から変なものが入らない） |
| **HTTPS**         | 防音壁（会話が外に漏れない）         |
| **監査ログ**      | 防犯カメラ（誰がいつ来たか記録）     |

### 現状のセキュリティレベル

```
✅ 玄関に頑丈な鍵がある（認証）
✅ 各部屋に個別の鍵がある（RLS）
✅ 防犯カメラが動いている（監査ログ）
✅ 窓に格子がある（CSP）
✅ 不審者は入れない（Rate Limiting）
```

**つまり**: 「一般的な住宅としては十分なセキュリティ」

---

## チェックリスト

### 定期確認（月1回）

- [ ] `npm audit` の結果確認
- [ ] Dependabot PR の対応
- [ ] Sentry でセキュリティ関連エラー確認
- [ ] GitHub Security Alerts 確認

### インシデント発生時

1. [RUNBOOK.md](RUNBOOK.md) の RB-002（認証障害）を参照
2. 影響範囲を特定
3. 必要に応じてサービス一時停止
4. ポストモーテム作成

---

## 関連ドキュメント

| ドキュメント                                                                          | 内容                   |
| ------------------------------------------------------------------------------------- | ---------------------- |
| [/SECURITY.md](/SECURITY.md)                                                          | セキュリティポリシー   |
| [ALERTING.md](ALERTING.md)                                                            | アラート設定           |
| [RUNBOOK.md](RUNBOOK.md)                                                              | 障害対応手順           |
| [docs/security/GITHUB_ACTIONS_SECURITY.md](/docs/security/GITHUB_ACTIONS_SECURITY.md) | CI/CDセキュリティ      |
| [docs/security/ACCOUNT_LOCKOUT.md](/docs/security/ACCOUNT_LOCKOUT.md)                 | アカウントロックアウト |

---

## 改訂履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2025-12-26 | v1.0       | 初版作成 |
