# Incident Response Plan

BoxLogのセキュリティインシデント対応計画 - 迅速かつ効果的なインシデント対応

---

## 🎯 Purpose (目的)

このドキュメントは、セキュリティインシデント発生時の**明確な対応フロー**を定義し、
迅速な復旧とユーザー保護を実現するためのものです。

### 適用範囲

- セキュリティ侵害（データ漏洩、不正アクセス等）
- サービス障害（DDoS攻撃、システム停止等）
- 脆弱性の悪用
- 内部不正

---

## 📊 Severity Levels (深刻度レベル)

### P0: Critical (緊急)

**影響**: サービス全体に重大な影響

| 基準               | 例                             |
| ------------------ | ------------------------------ |
| データ侵害         | 個人情報・認証情報の漏洩       |
| 認証バイパス       | パスワードなしでログイン可能   |
| 完全なサービス停止 | すべてのユーザーがアクセス不可 |
| リモートコード実行 | サーバーへの不正コマンド実行   |

**対応時間**:

- 初動: 即座（24時間体制）
- 状況更新: 1時間ごと
- 修正目標: 48時間以内

### P1: High (高)

**影響**: 重要機能に影響

| 基準                 | 例                                 |
| -------------------- | ---------------------------------- |
| 権限昇格             | 一般ユーザーが管理者権限を取得     |
| 部分的なサービス停止 | 一部機能が使用不可                 |
| XSS脆弱性            | クロスサイトスクリプティング       |
| CSRF脆弱性           | クロスサイトリクエストフォージェリ |

**対応時間**:

- 初動: 4時間以内
- 状況更新: 6時間ごと
- 修正目標: 1週間以内

### P2: Medium (中)

**影響**: 一部機能に影響

| 基準               | 例                     |
| ------------------ | ---------------------- |
| 情報漏洩（非機密） | 公開情報の不適切な開示 |
| サービス品質低下   | パフォーマンス低下     |
| 設定ミス           | セキュリティ設定の不備 |

**対応時間**:

- 初動: 24時間以内
- 状況更新: 週次
- 修正目標: 2週間以内

### P3: Low (低)

**影響**: 軽微な影響

| 基準               | 例                     |
| ------------------ | ---------------------- |
| 軽微な情報漏洩     | バージョン情報の表示   |
| エラーメッセージ   | 詳細なエラー情報の表示 |
| パフォーマンス問題 | 一部ユーザーの遅延     |

**対応時間**:

- 初動: 2週間以内
- 修正目標: 次回リリース

---

## 🔄 Response Flow (対応フロー)

### Phase 1: Detection (検知)

インシデントを検知するための仕組み:

#### 自動検知

- **Sentry**: エラー・異常な動作の監視
- **Vercel**: サービス停止・パフォーマンス低下
- **Supabase**: データベース異常アクセス
- **Rate Limiting**: 異常なトラフィックパターン

#### 手動報告

- **ユーザー報告**: support@boxlog.app
- **セキュリティ研究者**: security@boxlog.app
- **内部発見**: 開発チームによる発見

#### 検知時のアクション

1. ✅ インシデントチケット作成
2. ✅ 初期評価（深刻度判定）
3. ✅ 対応チーム招集

### Phase 2: Assessment (評価)

インシデントの影響範囲を評価:

#### 評価項目

- **影響範囲**: 影響を受けるユーザー数
- **データ種類**: 個人情報、認証情報、業務データ等
- **悪用の可能性**: 既に悪用されているか
- **法的義務**: GDPR通知義務の有無

#### 評価結果の記録

```markdown
## Incident Assessment

- **Incident ID**: INC-2025-001
- **Detected**: 2025-10-15 14:30 JST
- **Severity**: P0 (Critical)
- **Type**: Data Breach
- **Affected Users**: ~1000 users
- **Data Exposed**: Email addresses, usernames
- **Legal Obligation**: GDPR notification required
```

### Phase 3: Containment (封じ込め)

被害拡大を防ぐための即座の対応:

#### 短期的封じ込め

- 🚨 **侵害されたアカウントの無効化**
- 🚨 **攻撃元IPアドレスのブロック**
- 🚨 **脆弱な機能の一時停止**
- 🚨 **全ユーザーの強制ログアウト**（必要に応じて）

#### 長期的封じ込め

- 🔧 **セキュリティパッチの適用**
- 🔧 **認証トークンの無効化**
- 🔧 **影響を受けたデータの隔離**

### Phase 4: Eradication (根絶)

脆弱性の完全な修正:

#### 修正手順

1. **根本原因の特定**
   - コードレビュー
   - ログ分析
   - 脆弱性スキャン

2. **修正の実装**
   - コード修正
   - 依存関係の更新
   - 設定の変更

3. **テストの実施**
   - 単体テスト
   - 統合テスト
   - ペネトレーションテスト

4. **デプロイ**
   - ステージング環境での検証
   - 本番環境へのデプロイ
   - ロールバック手順の準備

### Phase 5: Recovery (復旧)

サービスの正常化:

#### 復旧手順

1. **サービスの再開**
   - 機能の段階的な復旧
   - モニタリング強化

2. **データの整合性確認**
   - バックアップからの復元（必要に応じて）
   - データ整合性チェック

3. **ユーザー通知**
   - 影響を受けたユーザーへの個別通知
   - 全ユーザーへの状況報告

### Phase 6: Post-Incident (事後対応)

再発防止と学習:

#### Post-Mortem Report (事後報告)

```markdown
## Post-Mortem: INC-2025-001

### Timeline

- 14:30 - インシデント検知
- 14:35 - 初期評価完了 (P0)
- 14:40 - 封じ込め開始
- 16:00 - 修正完了
- 17:00 - サービス復旧

### Root Cause

- SQLインジェクション脆弱性
- 入力検証の不備

### Impact

- 1000 users affected
- Email addresses exposed
- No financial data compromised

### Actions Taken

- Patched vulnerability
- Enhanced input validation
- Implemented WAF rules

### Lessons Learned

- 入力検証の強化が必要
- モニタリングの改善
- インシデント対応訓練の実施

### Preventive Measures

- [ ] コードレビュー強化
- [ ] セキュリティテストの自動化
- [ ] 定期的な脆弱性スキャン
```

#### GDPR Compliance (GDPR準拠)

**72時間ルール**: データ侵害発生から72時間以内に監督機関に通知

```markdown
## GDPR Notification Checklist

- [ ] 侵害の性質を説明
- [ ] 個人データ保護責任者の連絡先
- [ ] 侵害の影響と結果を記載
- [ ] 被害軽減措置を説明
- [ ] 影響を受けたユーザーに通知（高リスクの場合）
```

---

## 👥 Roles and Responsibilities (役割と責任)

### Incident Response Team

| 役割                  | 責任                             |
| --------------------- | -------------------------------- |
| Incident Commander    | 全体指揮、意思決定               |
| Technical Lead        | 技術的調査、修正実装             |
| Communications Lead   | ユーザー通知、プレスリリース     |
| Legal Advisor         | 法的義務の確認、GDPR対応         |
| Customer Support Lead | ユーザーサポート、問い合わせ対応 |

### Escalation Path (エスカレーション)

```
Level 1: On-Call Engineer (24時間以内)
    ↓
Level 2: Technical Lead (4時間以内 for P1+)
    ↓
Level 3: CTO/CEO (即座 for P0)
```

---

## 📞 Communication Plan (コミュニケーション計画)

### Internal Communication (内部通知)

#### Slack Channels

- `#security-incidents` - リアルタイム更新
- `#engineering` - 技術的な議論
- `#leadership` - 経営層への報告

#### Email

- `security-team@boxlog.app` - セキュリティチーム
- `leadership@boxlog.app` - 経営層

### External Communication (外部通知)

#### User Notification (ユーザー通知)

**P0/P1 インシデントの場合:**

```
件名: [重要] BoxLog セキュリティインシデントのお知らせ

いつもBoxLogをご利用いただき、ありがとうございます。

[日時]に発生したセキュリティインシデントについてお知らせいたします。

【影響を受けたデータ】
- メールアドレス
- ユーザー名

【対応状況】
- 脆弱性は修正済みです
- 不正アクセスは遮断されました

【お客様にお願いしたいこと】
1. パスワードの変更を推奨します
2. 不審なメールに注意してください

ご迷惑をおかけし、申し訳ございません。

BoxLog セキュリティチーム
security@boxlog.app
```

#### Status Page (ステータスページ)

https://status.boxlog.app

- リアルタイムのサービス状況
- インシデント履歴
- メンテナンス予定

---

## 🔒 Security Measures (事前対策)

### Prevention (予防)

- **コードレビュー**: すべてのPRでセキュリティチェック
- **自動テスト**: SAST/DAST ツールによる自動スキャン
- **依存関係管理**: Dependabot による定期更新

### Detection (検知)

- **Sentry**: エラー・異常動作の監視
- **Rate Limiting**: 異常なトラフィックの検知
- **Log Analysis**: 不審なアクセスパターンの検出

### Response (対応)

- **Runbook**: インシデント対応手順書
- **Training**: 定期的な訓練（年4回）
- **Backup**: 毎日のバックアップ

---

## 📊 Incident Metrics (インシデントメトリクス)

### Key Performance Indicators (KPI)

| 指標                 | 目標値     |
| -------------------- | ---------- |
| Mean Time to Detect  | < 1 hour   |
| Mean Time to Respond | < 4 hours  |
| Mean Time to Recover | < 24 hours |
| False Positive Rate  | < 10%      |

---

## 📖 Related Documents (関連ドキュメント)

- [Security Policy](./SECURITY.md) - セキュリティポリシー
- [Vulnerability Disclosure](./VULNERABILITY_DISCLOSURE.md) - 脆弱性報告ガイドライン
- [Privacy Policy](/legal/privacy) - プライバシーポリシー

---

## 🔄 Policy Updates (ポリシー更新)

このインシデント対応計画は、実際のインシデントから学び、定期的に更新されます。

**最終更新日**: 2025-10-15
**次回レビュー**: 2026-04-15

---

## 🚨 Emergency Contacts (緊急連絡先)

### 24/7 On-Call

- **Email**: security@boxlog.app
- **Phone**: [緊急連絡先]（準備中）

### External Support

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Sentry Support**: support@sentry.io

---

**Remember**: 迅速な対応と透明性のあるコミュニケーションが、ユーザーの信頼を守ります。
