# Security Policy

## 📋 Supported Versions (サポート対象バージョン)

セキュリティアップデートを提供しているバージョン:

| Version | Supported          | Status      |
| ------- | ------------------ | ----------- |
| 1.x.x   | :white_check_mark: | Production  |
| 0.x.x   | :x:                | Development |

---

## 🔒 Reporting a Vulnerability (脆弱性の報告)

**セキュリティ脆弱性は公開のGitHub Issuesで報告しないでください。**

### 報告窓口

以下のいずれかの方法で報告してください:

1. **Email**: security@boxlog.app
2. **GitHub Security Advisory**: [Create Advisory](https://github.com/t3-nico/boxlog-app/security/advisories/new)

### 報告に含めるべき情報

脆弱性を迅速に評価・修正するため、以下の情報を提供してください:

- **脆弱性の種類** (XSS, SQLインジェクション, 認証バイパス等)
- **影響を受けるバージョン**
- **再現手順** (詳細なステップ)
- **概念実証コード** (Proof of Concept, 可能であれば)
- **潜在的な影響** (データ漏洩、サービス停止等)
- **推奨される修正方法** (任意)

### 対応タイムライン

脆弱性の深刻度に応じて、以下のタイムラインで対応します:

| 深刻度   | 初動確認   | 修正リリース       |
| -------- | ---------- | ------------------ |
| Critical | 24時間以内 | 48時間以内         |
| High     | 48時間以内 | 1週間以内          |
| Medium   | 1週間以内  | 2週間以内          |
| Low      | 2週間以内  | 次回リリースに含む |

---

## 🛡️ Security Measures (セキュリティ対策)

BoxLogでは以下のセキュリティ対策を実施しています:

### インフラストラクチャ

- **HTTPS強制**: すべての通信をTLS 1.3で暗号化
- **Vercelホスティング**: DDoS保護、自動スケーリング
- **Supabase**: Row Level Security (RLS)、データ暗号化

### アプリケーション

- **認証**: Supabase Auth（JWT + リフレッシュトークン）
- **多要素認証 (MFA)**: TOTP（Time-based One-Time Password）対応
- **レート制限**: API呼び出し制限によるブルートフォース攻撃防止
- **SQL インジェクション対策**: Prisma ORM + Parameterized Queries
- **XSS対策**: React自動エスケープ + Content Security Policy (CSP)
- **CSRF対策**: SameSite Cookie + トークン検証

### 依存関係管理

- **自動更新**: Dependabot による週次チェック
- **脆弱性スキャン**: `npm audit` による定期チェック

### モニタリング

- **エラー追跡**: Sentry によるリアルタイム監視
- **パフォーマンス監視**: Vercel Analytics

---

## 🔐 Responsible Disclosure (責任ある開示)

善意のセキュリティ研究者を保護するため、以下のルールを設けています:

### 許可される行為

- ✅ セキュリティテストの実施（自身のアカウント内で）
- ✅ 脆弱性の調査と報告
- ✅ 概念実証コードの作成

### 禁止される行為

- ❌ DoS/DDoS攻撃
- ❌ 実際のユーザーデータへのアクセス
- ❌ 第三者への脆弱性情報の開示（修正前）
- ❌ 脆弱性の悪用

---

## 📖 Detailed Documentation (詳細ドキュメント)

より詳細なセキュリティポリシーと脆弱性報告ガイドラインは、以下のドキュメントをご覧ください:

- [Security Policy (詳細版)](./docs/legal/SECURITY.md)
- [Vulnerability Disclosure Guidelines](./docs/legal/VULNERABILITY_DISCLOSURE.md)
- [Incident Response Plan](./docs/legal/INCIDENT_RESPONSE.md)

---

## 📞 Contact (連絡先)

### セキュリティチーム

- **Email**: security@boxlog.app
- **Response Time**: 24時間以内（平日）

### 一般的な問い合わせ

- **Email**: support@boxlog.app
- **Website**: https://boxlog.app

---

**ありがとうございます**: セキュリティ向上にご協力いただき、ありがとうございます。
皆様の報告により、すべてのユーザーの安全性が向上します。

**最終更新日**: 2025-10-15
